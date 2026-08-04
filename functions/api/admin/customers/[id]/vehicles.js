import { requireUser } from "../../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../../_lib/http.js";

export async function onRequestPost({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const customer = await env.DB.prepare("SELECT id FROM users WHERE id=?1 AND role='customer' AND status!='closed'").bind(params.id).first();
    if (!customer) throw new HttpError(404, "Cliente no encontrado");
    const brand = String(body.brand || "").trim();
    const model = String(body.model || "").trim();
    const modelYear = Number(body.modelYear) || null;
    const odometerKm = Math.max(0, Number(body.odometerKm) || 0);
    const plate = String(body.plate || "").trim().toUpperCase();
    const vin = String(body.vin || "").trim().toUpperCase();
    if (!brand || !model) throw new HttpError(400, "Marca y modelo son requeridos");
    if (modelYear && (modelYear < 1950 || modelYear > new Date().getFullYear() + 1)) throw new HttpError(400, "Ano de vehiculo invalido");
    if (vin.length > 17) throw new HttpError(400, "VIN invalido");
    const id = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO vehicles(id,user_id,brand,model,model_year,plate,vin,odometer_km) VALUES(?1,?2,?3,?4,?5,?6,?7,?8)").bind(id, params.id, brand, model, modelYear, plate, vin, odometerKm),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'vehicle.create','vehicle',?3,?4)").bind(crypto.randomUUID(), actor.id, id, JSON.stringify({ customerId: params.id })),
    ]);
    return json({ id }, 201);
  } catch (error) { return handleError(error); }
}
