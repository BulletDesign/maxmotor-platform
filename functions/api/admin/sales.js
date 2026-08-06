import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";
import { pointsForPurchase } from "../../_lib/points.js";

const MAX_ITEMS_PER_INVOICE = 25;
const TRACKING_MODES = new Set(["time", "mileage", "both"]);

function normalizeItems(body) {
  const source = Array.isArray(body.items) ? body.items : body.productId ? [body] : [];
  if (!source.length) throw new HttpError(400, "Agrega al menos un accesorio");
  if (source.length > MAX_ITEMS_PER_INVOICE) throw new HttpError(400, `Maximo ${MAX_ITEMS_PER_INVOICE} accesorios por factura`);
  return source.map((item) => ({
    productId: String(item?.productId || "").trim(),
    appliesWarranty: item?.appliesWarranty === true,
    installedAt: item?.installedAt ? String(item.installedAt) : null,
    installedKm: item?.installedKm === "" || item?.installedKm === null || item?.installedKm === undefined ? null : Number(item.installedKm),
  }));
}

function installationRecord(item, product, vehicle, issuedAt) {
  const appliesWarranty = item.appliesWarranty && Boolean(Number(product.coverageAvailable)) && TRACKING_MODES.has(product.trackingMode);
  const trackingMode = appliesWarranty ? product.trackingMode : "none";
  const installedAt = appliesWarranty && item.installedAt ? item.installedAt : issuedAt;
  const installedKm = appliesWarranty && ["mileage", "both"].includes(trackingMode) && item.installedKm !== null
    ? item.installedKm
    : Number(vehicle.odometerKm || 0);
  if (!Number.isInteger(installedKm) || installedKm < 0) throw new HttpError(400, `Kilometraje invalido para ${product.name}`);
  if (Number.isNaN(new Date(installedAt).getTime())) throw new HttpError(400, `Fecha de instalacion invalida para ${product.name}`);
  const serviceDays = ["time", "both"].includes(trackingMode) ? Number(product.serviceDays ?? product.warrantyDays) || 0 : 0;
  const serviceKm = ["mileage", "both"].includes(trackingMode) ? Number(product.serviceKm ?? product.warrantyKm) || 0 : 0;
  return {
    product,
    installedAt,
    installedKm,
    nextServiceAt: serviceDays ? new Date(new Date(installedAt).getTime() + serviceDays * 86400000).toISOString() : null,
    nextServiceKm: serviceKm ? installedKm + serviceKm : null,
    coverageType: appliesWarranty ? "full" : "limited",
    trackingMode,
    warrantyId: crypto.randomUUID(),
    installationId: crypto.randomUUID(),
  };
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const customerCode = String(body.customerCode || "").trim().toUpperCase();
    const invoiceNumber = String(body.invoiceNumber || "").trim().toUpperCase();
    const amountCents = Number(body.amountCents);
    const issuedAt = String(body.issuedAt || new Date().toISOString());
    const vehicleId = String(body.vehicleId || "").trim();
    const awardPoints = body.awardPoints !== false;
    const items = normalizeItems(body);
    if (!customerCode) throw new HttpError(400, "Codigo de cliente requerido");
    if (!invoiceNumber) throw new HttpError(400, "Factura requerida");
    if (!Number.isInteger(amountCents) || amountCents <= 0) throw new HttpError(400, "Total de factura invalido");
    if (Number.isNaN(new Date(issuedAt).getTime())) throw new HttpError(400, "Fecha de factura invalida");
    if (!vehicleId || items.some((item) => !item.productId)) throw new HttpError(400, "Vehiculo y productos son obligatorios");

    const productIds = [...new Set(items.map((item) => item.productId))];
    const productPlaceholders = productIds.map((_, index) => `?${index + 1}`).join(",");
    const [customer, duplicate, vehicle, productRows] = await Promise.all([
      env.DB.prepare("SELECT id FROM users WHERE customer_code=?1 AND role='customer' AND status='active'").bind(customerCode).first(),
      env.DB.prepare("SELECT id FROM invoices WHERE invoice_number=?1").bind(invoiceNumber).first(),
      env.DB.prepare("SELECT id,user_id userId,odometer_km odometerKm FROM vehicles WHERE id=?1").bind(vehicleId).first(),
      env.DB.prepare(`SELECT p.id,p.name,p.service_days serviceDays,p.service_km serviceKm,p.warranty_days warrantyDays,p.warranty_km warrantyKm,p.coverage_available coverageAvailable,p.tracking_mode trackingMode FROM operational_products p JOIN product_families f ON f.id=p.family_id WHERE p.id IN (${productPlaceholders}) AND p.active=1 AND f.active=1`).bind(...productIds).all(),
    ]);
    if (!customer) throw new HttpError(404, "Cliente no encontrado");
    if (duplicate) throw new HttpError(409, "La factura ya fue registrada");
    if (!vehicle || vehicle.userId !== customer.id) throw new HttpError(400, "Vehiculo invalido para este cliente");
    const products = new Map((productRows.results || []).map((product) => [product.id, product]));
    if (products.size !== productIds.length) throw new HttpError(404, "Uno o mas productos no estan disponibles");

    const installations = items.map((item) => installationRecord(item, products.get(item.productId), vehicle, issuedAt));
    const points = awardPoints ? pointsForPurchase(amountCents) : 0;
    const invoiceId = crypto.randomUUID();
    const statements = [
      env.DB.prepare("INSERT INTO invoices(id,invoice_number,user_id,amount_cents,issued_at,created_by,points_enabled) VALUES(?1,?2,?3,?4,?5,?6,?7)").bind(invoiceId, invoiceNumber, customer.id, amountCents, issuedAt, actor.id, Number(awardPoints)),
    ];
    if (points > 0) {
      statements.push(env.DB.prepare("INSERT INTO points_ledger(id,user_id,invoice_id,movement_type,points,description,created_by) VALUES(?1,?2,?3,'earn',?4,?5,?6)").bind(crypto.randomUUID(), customer.id, invoiceId, points, `1.5% de compra / factura ${invoiceNumber}`, actor.id));
    }
    for (const installation of installations) {
      statements.push(
        env.DB.prepare("INSERT INTO warranties(id,user_id,vehicle_id,invoice_id,product_name,installed_at,service_due_km,service_due_at,status) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'active')").bind(installation.warrantyId, customer.id, vehicle.id, invoiceId, installation.product.name, installation.installedAt, installation.nextServiceKm, installation.nextServiceAt),
        env.DB.prepare("INSERT INTO installations(id,user_id,vehicle_id,product_id,invoice_id,warranty_id,installed_at,installed_km,next_service_at,next_service_km,coverage_type,tracking_mode,created_by) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)").bind(installation.installationId, customer.id, vehicle.id, installation.product.id, invoiceId, installation.warrantyId, installation.installedAt, installation.installedKm, installation.nextServiceAt, installation.nextServiceKm, installation.coverageType, installation.trackingMode, actor.id),
      );
    }
    const highestOdometer = Math.max(Number(vehicle.odometerKm || 0), ...installations.map((item) => item.installedKm));
    statements.push(
      env.DB.prepare("UPDATE vehicles SET odometer_km=?1 WHERE id=?2 AND (odometer_km IS NULL OR odometer_km<?1)").bind(highestOdometer, vehicle.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'sale.install.multi','invoice',?3,?4)").bind(crypto.randomUUID(), actor.id, invoiceId, JSON.stringify({ customerCode, invoiceNumber, amountCents, awardPoints, points, vehicleId: vehicle.id, items: installations.map((item) => ({ productId: item.product.id, coverageType: item.coverageType, trackingMode: item.trackingMode })) })),
    );
    await env.DB.batch(statements);
    return json({
      invoiceId,
      points,
      awardPoints,
      itemCount: installations.length,
      installations: installations.map((item) => ({ installationId: item.installationId, warrantyId: item.warrantyId, productId: item.product.id, coverageType: item.coverageType, trackingMode: item.trackingMode, nextServiceAt: item.nextServiceAt, nextServiceKm: item.nextServiceKm })),
    }, 201);
  } catch (error) { return handleError(error); }
}
