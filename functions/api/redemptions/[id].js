import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const status = String(body.status || "");
    if (!["pending_delivery", "rejected", "claimed", "cancelled"].includes(status)) throw new HttpError(400, "Estado invalido");
    const current = await env.DB.prepare("SELECT id,user_id userId,reward_name rewardName,points_reserved pointsReserved,fulfillment_type fulfillmentType,product_id productId,status FROM redemptions WHERE id=?1").bind(params.id).first();
    if (!current) throw new HttpError(404, "Canje no encontrado");
    const transitions = { requested: ["pending_delivery", "rejected", "cancelled"], pending_delivery: ["claimed", "rejected"], rejected: [], claimed: [], cancelled: [] };
    if (!transitions[current.status]?.includes(status)) throw new HttpError(409, "Transicion de canje no permitida");
    const statements = [
      env.DB.prepare("UPDATE redemptions SET status=?1,reviewed_by=?2,updated_at=CURRENT_TIMESTAMP WHERE id=?3").bind(status, actor.id, params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'redemption.review','redemption',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ previous: current.status, status })),
    ];
    if (status === "pending_delivery") statements.push(env.DB.prepare("INSERT INTO points_ledger(id,user_id,movement_type,points,description,created_by) VALUES(?1,?2,'redeem',?3,?4,?5)").bind(crypto.randomUUID(), current.userId, -current.pointsReserved, `Canje aceptado: ${current.rewardName}`, actor.id));
    if (status === "rejected" && current.status === "pending_delivery") statements.push(env.DB.prepare("INSERT INTO points_ledger(id,user_id,movement_type,points,description,created_by) VALUES(?1,?2,'refund',?3,?4,?5)").bind(crypto.randomUUID(), current.userId, current.pointsReserved, `Devolucion por canje rechazado: ${current.rewardName}`, actor.id));

    let installationId = null;
    if (status === "claimed" && current.fulfillmentType === "install") {
      if (!current.productId) throw new HttpError(409, "La recompensa ya no tiene un producto instalable vinculado");
      const [vehicle, product] = await Promise.all([
        env.DB.prepare("SELECT id,user_id userId,odometer_km odometerKm FROM vehicles WHERE id=?1").bind(body.vehicleId).first(),
        env.DB.prepare("SELECT id,name,service_days serviceDays,service_km serviceKm,coverage_available coverageAvailable,tracking_mode trackingMode FROM operational_products WHERE id=?1").bind(current.productId).first(),
      ]);
      if (!vehicle || vehicle.userId !== current.userId) throw new HttpError(400, "Selecciona un vehiculo del cliente");
      if (!product) throw new HttpError(409, "Producto de recompensa no disponible");
      const installedAt = new Date().toISOString();
      const installedKm = Number(vehicle.odometerKm || 0);
      const trackingMode = Number(product.coverageAvailable) ? product.trackingMode || "none" : "none";
      const nextServiceAt = ["time", "both"].includes(trackingMode) && product.serviceDays ? new Date(Date.now() + Number(product.serviceDays) * 86400000).toISOString() : null;
      const nextServiceKm = ["mileage", "both"].includes(trackingMode) && product.serviceKm ? installedKm + Number(product.serviceKm) : null;
      const warrantyId = crypto.randomUUID();
      installationId = crypto.randomUUID();
      statements.push(
        env.DB.prepare("INSERT INTO warranties(id,user_id,vehicle_id,product_name,installed_at,service_due_km,service_due_at,status) VALUES(?1,?2,?3,?4,?5,?6,?7,'active')").bind(warrantyId, current.userId, vehicle.id, product.name, installedAt, nextServiceKm, nextServiceAt),
        env.DB.prepare("INSERT INTO installations(id,user_id,vehicle_id,product_id,warranty_id,installed_at,installed_km,next_service_at,next_service_km,coverage_type,tracking_mode,created_by) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,'reward',?10,?11)").bind(installationId, current.userId, vehicle.id, product.id, warrantyId, installedAt, installedKm, nextServiceAt, nextServiceKm, trackingMode, actor.id),
        env.DB.prepare("UPDATE redemptions SET installation_id=?1 WHERE id=?2").bind(installationId, params.id),
      );
    }
    await env.DB.batch(statements);
    return json({ ok: true, status, installationId });
  } catch (error) { return handleError(error); }
}
