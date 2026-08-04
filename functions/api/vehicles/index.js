import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireUser(request, env.DB);
    const result = await env.DB.prepare(
      "SELECT id,brand,model,model_year AS modelYear,plate,vin,odometer_km AS odometerKm,created_at AS createdAt FROM vehicles WHERE user_id=?1 ORDER BY created_at"
    ).bind(user.id).all();
    return json({ vehicles: result.results || [] });
  } catch (error) {
    return handleError(error);
  }
}
