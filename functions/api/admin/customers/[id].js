import { requireUser } from "../../../_lib/auth.js";
import { deleteCustomerData } from "../../../_lib/customer-data.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../_lib/http.js";

export async function onRequestGet({ request, env, params }) {
  try {
    await requireUser(request, env.DB, ["employee", "superadmin"]);
    const customer = await env.DB.prepare("SELECT id,customer_code AS customerCode,full_name AS fullName,email,phone,status,created_at AS createdAt FROM users WHERE id=?1 AND role='customer'").bind(params.id).first();
    if (!customer) throw new HttpError(404, "Cliente no encontrado");
    const [vehicles, installations, maintenanceHistory, points, invoices] = await Promise.all([
      env.DB.prepare("SELECT id,brand,model,model_year AS modelYear,plate,vin,odometer_km AS odometerKm FROM vehicles WHERE user_id=?1").bind(params.id).all(),
      env.DB.prepare("SELECT i.id,p.name productName,f.name familyName,i.installed_at installedAt,i.installed_km installedKm,i.next_service_at nextServiceAt,i.next_service_km nextServiceKm,p.service_days serviceDays,p.service_km serviceKm,i.coverage_type coverageType,i.tracking_mode trackingMode,i.status,v.brand,v.model,v.plate,(SELECT we.created_at FROM warranty_events we WHERE we.installation_id=i.id AND we.event_type='serviced' ORDER BY we.created_at DESC LIMIT 1) lastServiceAt,(SELECT we.service_odometer_km FROM warranty_events we WHERE we.installation_id=i.id AND we.event_type='serviced' ORDER BY we.created_at DESC LIMIT 1) lastServiceKm FROM installations i JOIN operational_products p ON p.id=i.product_id JOIN product_families f ON f.id=p.family_id JOIN vehicles v ON v.id=i.vehicle_id WHERE i.user_id=?1 AND i.status!='void' ORDER BY i.created_at DESC").bind(params.id).all(),
      env.DB.prepare("SELECT we.id,we.installation_id installationId,we.created_at servicedAt,we.service_odometer_km odometerKm,we.notes,we.new_due_at nextServiceAt,we.new_due_km nextServiceKm FROM warranty_events we JOIN installations i ON i.id=we.installation_id WHERE i.user_id=?1 AND we.event_type='serviced' ORDER BY we.created_at DESC").bind(params.id).all(),
      env.DB.prepare("SELECT COALESCE(SUM(points),0) balance FROM points_ledger WHERE user_id=?1").bind(params.id).first(),
      env.DB.prepare("SELECT (SELECT COUNT(*) FROM invoices WHERE user_id=?1) total,(SELECT COALESCE(SUM(amount_cents),0) FROM invoices WHERE user_id=?1)+(SELECT COALESCE(SUM(cash_after_points_cents),0) FROM redemptions WHERE user_id=?1 AND status='claimed') amountCents").bind(params.id).first(),
    ]);
    customer.points = points.balance;
    return json({ customer, vehicles: vehicles.results || [], installations: installations.results || [], maintenanceHistory: maintenanceHistory.results || [], invoices });
  } catch (error) { return handleError(error); }
}

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare("SELECT full_name fullName,email,phone,status FROM users WHERE id=?1 AND role='customer'").bind(params.id).first();
    if (!current) throw new HttpError(404, "Cliente no encontrado");
    const fullName = String(body.fullName ?? current.fullName).trim();
    const phone = String(body.phone ?? current.phone ?? "").trim();
    const email = String(body.email ?? current.email).trim().toLowerCase();
    const status = body.status ? (["active", "suspended"].includes(body.status) ? body.status : null) : current.status;
    if (fullName.length < 3 || !email || !status) throw new HttpError(400, "Datos incompletos");
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET full_name=?1,phone=?2,email=?3,status=?4,updated_at=CURRENT_TIMESTAMP WHERE id=?5 AND role='customer'").bind(fullName, phone, email, status, params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'customer.update','user',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ fullName, email, phone, status })),
    ]);
    if (status !== "active") await env.DB.prepare("DELETE FROM sessions WHERE user_id=?1").bind(params.id).run();
    return json({ ok: true, status });
  } catch (error) { return handleError(error); }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    if (String(body.confirmation || "") !== "ELIMINAR CLIENTE") throw new HttpError(400, "Confirmacion requerida");
    await deleteCustomerData(env.DB, params.id, actor.id);
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}
