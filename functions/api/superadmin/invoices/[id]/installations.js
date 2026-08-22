import { requireUser } from "../../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../../_lib/http.js";
import { initialMaintenanceSchedule, recurringMaintenanceInterval } from "../../../../_lib/maintenance-schedule.js";

const TRACKING_MODES = new Set(["time", "mileage", "both"]);
const DAY_MS = 86400000;

export async function onRequestPost({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["superadmin"]);
    const body = await readJson(request);
    const productId = String(body.productId || "");
    const vehicleId = String(body.vehicleId || "");
    const reason = String(body.reason || "Accesorio corregido en factura").trim();
    const [invoice, product, vehicle] = await Promise.all([
      env.DB.prepare("SELECT id,user_id userId,invoice_number invoiceNumber,issued_at issuedAt FROM invoices WHERE id=?1").bind(params.id).first(),
      env.DB.prepare("SELECT p.id,p.name,f.name familyName,p.service_days serviceDays,p.service_km serviceKm,p.warranty_days warrantyDays,p.warranty_km warrantyKm,p.coverage_available coverageAvailable,p.tracking_mode trackingMode FROM operational_products p JOIN product_families f ON f.id=p.family_id WHERE p.id=?1 AND p.active=1 AND f.active=1").bind(productId).first(),
      env.DB.prepare("SELECT id,user_id userId,odometer_km odometerKm FROM vehicles WHERE id=?1").bind(vehicleId).first(),
    ]);
    if (!invoice) throw new HttpError(404, "Factura no encontrada");
    if (!product) throw new HttpError(404, "Producto no disponible");
    if (!vehicle || vehicle.userId !== invoice.userId) throw new HttpError(400, "Vehiculo invalido para esta factura");
    if (reason.length < 5) throw new HttpError(400, "Explica el motivo de la correccion");

    const appliesWarranty = body.appliesWarranty === true && Boolean(Number(product.coverageAvailable)) && TRACKING_MODES.has(product.trackingMode);
    const trackingMode = appliesWarranty ? product.trackingMode : "none";
    const installedAt = String(body.installedAt || invoice.issuedAt);
    const installedKm = body.installedKm === "" || body.installedKm === undefined ? Number(vehicle.odometerKm || 0) : Number(body.installedKm);
    if (Number.isNaN(new Date(installedAt).getTime())) throw new HttpError(400, "Fecha de instalacion invalida");
    if (!Number.isInteger(installedKm) || installedKm < 0) throw new HttpError(400, "Kilometraje de instalacion invalido");
    const initial = initialMaintenanceSchedule({ product, trackingMode, installedAt, installedKm });
    let nextServiceAt = initial.nextServiceAt;
    let nextServiceKm = initial.nextServiceKm;
    let service = null;
    if (body.serviceCompleted === true) {
      if (trackingMode === "none") throw new HttpError(409, "Una garantia limitada no admite mantenimiento programado");
      const servicedAt = String(body.servicedAt || "");
      const serviceKm = Number(body.serviceKm);
      if (Number.isNaN(new Date(servicedAt).getTime())) throw new HttpError(400, "Fecha de mantenimiento invalida");
      if (!Number.isInteger(serviceKm) || serviceKm < installedKm) throw new HttpError(400, "Kilometraje de mantenimiento invalido");
      const recurring = recurringMaintenanceInterval(product, trackingMode);
      nextServiceAt = recurring.serviceDays ? new Date(new Date(servicedAt).getTime() + recurring.serviceDays * DAY_MS).toISOString() : null;
      nextServiceKm = recurring.serviceKm ? serviceKm + recurring.serviceKm : null;
      service = { servicedAt, serviceKm };
    }

    const warrantyId = crypto.randomUUID();
    const installationId = crypto.randomUUID();
    const statements = [
      env.DB.prepare("INSERT INTO warranties(id,user_id,vehicle_id,invoice_id,product_name,installed_at,service_due_km,service_due_at,status) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'active')").bind(warrantyId, invoice.userId, vehicle.id, invoice.id, product.name, installedAt, nextServiceKm, nextServiceAt),
      env.DB.prepare("INSERT INTO installations(id,user_id,vehicle_id,product_id,invoice_id,warranty_id,installed_at,installed_km,next_service_at,next_service_km,coverage_type,tracking_mode,created_by) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)").bind(installationId, invoice.userId, vehicle.id, product.id, invoice.id, warrantyId, installedAt, installedKm, nextServiceAt, nextServiceKm, appliesWarranty ? "full" : "limited", trackingMode, actor.id),
      env.DB.prepare("UPDATE vehicles SET odometer_km=?1 WHERE id=?2 AND (odometer_km IS NULL OR odometer_km<?1)").bind(service?.serviceKm || installedKm, vehicle.id),
    ];
    if (service) {
      statements.push(env.DB.prepare("INSERT INTO warranty_events(id,installation_id,event_type,previous_due_at,new_due_at,previous_due_km,new_due_km,notes,created_by,created_at,service_odometer_km) VALUES(?1,?2,'serviced',?3,?4,?5,?6,?7,?8,?9,?10)").bind(crypto.randomUUID(), installationId, initial.nextServiceAt, nextServiceAt, initial.nextServiceKm, nextServiceKm, reason, actor.id, service.servicedAt, service.serviceKm));
    }
    statements.push(env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'invoice.installation_correct','invoice',?3,?4)").bind(crypto.randomUUID(), actor.id, invoice.id, JSON.stringify({ reason, invoiceNumber: invoice.invoiceNumber, installationId, warrantyId, productId, vehicleId, appliesWarranty, trackingMode, installedAt, installedKm, service, nextServiceAt, nextServiceKm })));
    await env.DB.batch(statements);
    return json({ ok: true, installationId, warrantyId, nextServiceAt, nextServiceKm }, 201);
  } catch (error) { return handleError(error); }
}
