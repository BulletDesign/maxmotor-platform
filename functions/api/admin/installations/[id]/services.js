import { requireUser } from "../../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../../_lib/http.js";

export async function onRequestPost({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare(
      "SELECT i.id,i.vehicle_id vehicleId,i.warranty_id warrantyId,i.installed_km installedKm,i.next_service_at nextServiceAt,i.next_service_km nextServiceKm,p.service_days serviceDays,p.service_km serviceKm,p.warranty_days warrantyDays,p.warranty_km warrantyKm FROM installations i JOIN operational_products p ON p.id=i.product_id WHERE i.id=?1 AND i.status!='void'"
    ).bind(params.id).first();
    if (!current) throw new HttpError(404, "Accesorio instalado no encontrado");

    const odometerKm = Number(body.odometerKm);
    if (!Number.isInteger(odometerKm) || odometerKm < Number(current.installedKm || 0)) throw new HttpError(400, "Kilometraje actual invalido");
    const servicedAt = String(body.servicedAt || new Date().toISOString());
    const servicedDate = new Date(servicedAt);
    if (Number.isNaN(servicedDate.getTime())) throw new HttpError(400, "Fecha de revision invalida");
    const serviceDays = Math.max(0, Number(current.serviceDays ?? current.warrantyDays) || 0);
    const serviceKm = Math.max(0, Number(current.serviceKm ?? current.warrantyKm) || 0);
    if (!serviceDays && !serviceKm) throw new HttpError(409, "El producto no tiene un intervalo de mantenimiento configurado");

    const nextServiceAt = serviceDays ? new Date(servicedDate.getTime() + serviceDays * 86400000).toISOString() : null;
    const nextServiceKm = serviceKm ? odometerKm + serviceKm : null;
    const eventId = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare("UPDATE installations SET next_service_at=?1,next_service_km=?2,status='active' WHERE id=?3").bind(nextServiceAt, nextServiceKm, params.id),
      env.DB.prepare("UPDATE warranties SET service_due_at=?1,service_due_km=?2,status='active' WHERE id=?3").bind(nextServiceAt, nextServiceKm, current.warrantyId),
      env.DB.prepare("UPDATE vehicles SET odometer_km=?1 WHERE id=?2 AND (odometer_km IS NULL OR odometer_km<?1)").bind(odometerKm, current.vehicleId),
      env.DB.prepare("INSERT INTO warranty_events(id,installation_id,event_type,previous_due_at,new_due_at,previous_due_km,new_due_km,notes,created_by,created_at,service_odometer_km) VALUES(?1,?2,'serviced',?3,?4,?5,?6,?7,?8,?9,?10)").bind(eventId, params.id, current.nextServiceAt, nextServiceAt, current.nextServiceKm, nextServiceKm, String(body.notes || "").trim(), actor.id, servicedAt, odometerKm),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'maintenance.complete','installation',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ eventId, odometerKm, servicedAt, nextServiceAt, nextServiceKm })),
    ]);
    return json({ eventId, nextServiceAt, nextServiceKm }, 201);
  } catch (error) { return handleError(error); }
}
