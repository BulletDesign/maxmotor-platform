import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";
import { pointsForPurchase } from "../../_lib/points.js";

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const customerCode = String(body.customerCode || "").trim().toUpperCase();
    const invoiceNumber = String(body.invoiceNumber || "").trim().toUpperCase();
    const amountCents = Number(body.amountCents);
    const issuedAt = String(body.issuedAt || new Date().toISOString());
    if (!invoiceNumber) throw new HttpError(400, "Factura requerida");
    if (!Number.isInteger(amountCents) || amountCents <= 0) throw new HttpError(400, "Total de factura invalido");
    if (!body.vehicleId || !body.productId) throw new HttpError(400, "Vehiculo y producto son obligatorios");

    const [customer, duplicate, product, vehicle] = await Promise.all([
      env.DB.prepare("SELECT id FROM users WHERE customer_code=?1 AND role='customer' AND status='active'").bind(customerCode).first(),
      env.DB.prepare("SELECT id FROM invoices WHERE invoice_number=?1").bind(invoiceNumber).first(),
      env.DB.prepare("SELECT p.id,p.name,p.service_days serviceDays,p.service_km serviceKm,p.warranty_days warrantyDays,p.warranty_km warrantyKm,p.coverage_available coverageAvailable,p.tracking_mode trackingMode FROM operational_products p JOIN product_families f ON f.id=p.family_id WHERE p.id=?1 AND p.active=1 AND f.active=1").bind(body.productId).first(),
      env.DB.prepare("SELECT id,user_id userId,odometer_km odometerKm FROM vehicles WHERE id=?1").bind(body.vehicleId).first(),
    ]);
    if (!customer) throw new HttpError(404, "Cliente no encontrado");
    if (duplicate) throw new HttpError(409, "La factura ya fue registrada");
    if (!product) throw new HttpError(404, "Producto no encontrado");
    if (!vehicle || vehicle.userId !== customer.id) throw new HttpError(400, "Vehiculo invalido para este cliente");

    const appliesWarranty = body.appliesWarranty === true && Boolean(Number(product.coverageAvailable));
    const trackingMode = appliesWarranty && ["time", "mileage", "both"].includes(product.trackingMode) ? product.trackingMode : "none";
    const hasInstalledAt = appliesWarranty && Boolean(body.installedAt);
    const hasInstalledKm = appliesWarranty && ["mileage", "both"].includes(trackingMode) && body.installedKm !== "" && body.installedKm !== null && body.installedKm !== undefined;
    const installedAt = hasInstalledAt ? String(body.installedAt) : issuedAt;
    const installedKm = hasInstalledKm ? Number(body.installedKm) : Number(vehicle.odometerKm || 0);
    if (!Number.isInteger(installedKm) || installedKm < 0) throw new HttpError(400, "Kilometraje invalido");
    const coverageType = appliesWarranty ? "full" : "limited";
    const serviceDays = ["time", "both"].includes(trackingMode) ? Number(product.serviceDays ?? product.warrantyDays) || 0 : 0;
    const serviceKm = ["mileage", "both"].includes(trackingMode) ? Number(product.serviceKm ?? product.warrantyKm) || 0 : 0;
    const nextServiceAt = serviceDays ? new Date(new Date(installedAt).getTime() + serviceDays * 86400000).toISOString() : null;
    const nextServiceKm = serviceKm ? installedKm + serviceKm : null;
    const points = pointsForPurchase(amountCents);
    const invoiceId = crypto.randomUUID();
    const warrantyId = crypto.randomUUID();
    const installationId = crypto.randomUUID();
    const statements = [
      env.DB.prepare("INSERT INTO invoices(id,invoice_number,user_id,amount_cents,issued_at,created_by) VALUES(?1,?2,?3,?4,?5,?6)").bind(invoiceId, invoiceNumber, customer.id, amountCents, issuedAt, actor.id),
      env.DB.prepare("INSERT INTO warranties(id,user_id,vehicle_id,invoice_id,product_name,installed_at,service_due_km,service_due_at,status) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'active')").bind(warrantyId, customer.id, vehicle.id, invoiceId, product.name, installedAt, nextServiceKm, nextServiceAt),
      env.DB.prepare("INSERT INTO installations(id,user_id,vehicle_id,product_id,invoice_id,warranty_id,installed_at,installed_km,next_service_at,next_service_km,coverage_type,tracking_mode,created_by) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)").bind(installationId, customer.id, vehicle.id, product.id, invoiceId, warrantyId, installedAt, installedKm, nextServiceAt, nextServiceKm, coverageType, trackingMode, actor.id),
      env.DB.prepare("UPDATE vehicles SET odometer_km=?1 WHERE id=?2 AND (odometer_km IS NULL OR odometer_km<?1)").bind(installedKm, vehicle.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'sale.install','invoice',?3,?4)").bind(crypto.randomUUID(), actor.id, invoiceId, JSON.stringify({ customerCode, invoiceNumber, productId: product.id, vehicleId: vehicle.id, points, coverageType, trackingMode })),
    ];
    if (points > 0) statements.splice(1, 0, env.DB.prepare("INSERT INTO points_ledger(id,user_id,invoice_id,movement_type,points,description,created_by) VALUES(?1,?2,?3,'earn',?4,?5,?6)").bind(crypto.randomUUID(), customer.id, invoiceId, points, `Compra factura ${invoiceNumber}`, actor.id));
    await env.DB.batch(statements);
    return json({ invoiceId, installationId, warrantyId, points, coverageType, trackingMode, nextServiceAt, nextServiceKm }, 201);
  } catch (error) { return handleError(error); }
}
