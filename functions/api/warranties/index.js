import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireUser(request, env.DB);
    const result = await env.DB.prepare(
      "SELECT w.id,w.product_name AS productName,w.installed_at AS installedAt,w.service_due_km AS serviceDueKm,w.service_due_at AS serviceDueAt,w.status,v.brand,v.model,v.plate FROM warranties w JOIN vehicles v ON v.id=w.vehicle_id WHERE w.user_id=?1 ORDER BY w.installed_at DESC"
    ).bind(user.id).all();
    return json({ warranties: result.results || [] });
  } catch (error) { return handleError(error); }
}
