import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireUser(request, env.DB, ["customer"]);
    const [result, installations] = await Promise.all([env.DB.prepare(
      "SELECT id,brand,model,model_year AS modelYear,plate,vin,odometer_km AS odometerKm,created_at AS createdAt FROM vehicles WHERE user_id=?1 ORDER BY created_at"
    ).bind(user.id).all(), env.DB.prepare("SELECT i.id,i.vehicle_id AS vehicleId,p.name AS productName,f.name AS familyName,i.installed_at AS installedAt,i.installed_km AS installedKm,i.next_service_at AS nextServiceAt,i.next_service_km AS nextServiceKm,i.status FROM installations i JOIN operational_products p ON p.id=i.product_id JOIN product_families f ON f.id=p.family_id WHERE i.user_id=?1 AND i.status!='void' ORDER BY i.installed_at DESC").bind(user.id).all()]);
    return json({ vehicles: result.results || [], installations: installations.results || [] });
  } catch (error) {
    return handleError(error);
  }
}
