import { requireUser } from "../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare("SELECT family_id familyId,name,warranty_days warrantyDays,warranty_km warrantyKm,service_days serviceDays,service_km serviceKm,coverage_available coverageAvailable,tracking_mode trackingMode,active FROM operational_products WHERE id=?1").bind(params.id).first();
    if (!current) throw new HttpError(404, "Producto no encontrado");
    const familyId = String(body.familyId ?? current.familyId);
    const name = String(body.name ?? current.name).trim();
    const coverageAvailable = body.coverageAvailable === undefined ? Number(current.coverageAvailable) : Number(body.coverageAvailable === true || body.coverageAvailable === "yes" || body.coverageAvailable === 1);
    const requestedMode = String(body.trackingMode ?? current.trackingMode ?? "none");
    const trackingMode = coverageAvailable && ["time", "mileage", "both"].includes(requestedMode) ? requestedMode : "none";
    const serviceDays = ["time", "both"].includes(trackingMode) ? Math.max(0, Number(body.serviceDays ?? current.serviceDays) || 0) || null : null;
    const serviceKm = ["mileage", "both"].includes(trackingMode) ? Math.max(0, Number(body.serviceKm ?? current.serviceKm) || 0) || null : null;
    const warrantyDays = serviceDays;
    const warrantyKm = serviceKm;
    const active = body.active === undefined ? Number(current.active) : Number(Boolean(body.active));
    if (!name || !familyId) throw new HttpError(400, "Producto y familia requeridos");
    const family = await env.DB.prepare("SELECT id FROM product_families WHERE id=?1").bind(familyId).first();
    if (!family) throw new HttpError(400, "Familia invalida");
    if (trackingMode !== "none" && !serviceDays && !serviceKm) throw new HttpError(400, "Configura el intervalo de seguimiento");
    await env.DB.batch([
      env.DB.prepare("UPDATE operational_products SET family_id=?1,name=?2,warranty_days=?3,warranty_km=?4,service_days=?5,service_km=?6,coverage_available=?7,tracking_mode=?8,active=?9 WHERE id=?10").bind(familyId, name, warrantyDays, warrantyKm, serviceDays, serviceKm, coverageAvailable, trackingMode, active, params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'product.update','operational_product',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ familyId, name, coverageAvailable, trackingMode, serviceDays, serviceKm, active })),
    ]);
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}
