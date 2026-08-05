import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireUser(request, env.DB, ["customer"]);
    const [result, installations, maintenanceHistory] = await Promise.all([env.DB.prepare(
      "SELECT id,brand,model,model_year AS modelYear,plate,vin,odometer_km AS odometerKm,created_at AS createdAt FROM vehicles WHERE user_id=?1 ORDER BY created_at"
    ).bind(user.id).all(), env.DB.prepare("SELECT i.id,i.vehicle_id AS vehicleId,p.name AS productName,f.name AS familyName,i.installed_at AS installedAt,i.installed_km AS installedKm,i.next_service_at AS nextServiceAt,i.next_service_km AS nextServiceKm,p.service_days AS serviceDays,p.service_km AS serviceKm,i.status,(SELECT we.created_at FROM warranty_events we WHERE we.installation_id=i.id AND we.event_type='serviced' ORDER BY we.created_at DESC LIMIT 1) AS lastServiceAt,(SELECT we.service_odometer_km FROM warranty_events we WHERE we.installation_id=i.id AND we.event_type='serviced' ORDER BY we.created_at DESC LIMIT 1) AS lastServiceKm FROM installations i JOIN operational_products p ON p.id=i.product_id JOIN product_families f ON f.id=p.family_id WHERE i.user_id=?1 AND i.status!='void' ORDER BY i.installed_at DESC").bind(user.id).all(), env.DB.prepare("SELECT we.id,we.installation_id AS installationId,we.created_at AS servicedAt,we.service_odometer_km AS odometerKm,we.notes,we.new_due_at AS nextServiceAt,we.new_due_km AS nextServiceKm FROM warranty_events we JOIN installations i ON i.id=we.installation_id WHERE i.user_id=?1 AND we.event_type='serviced' ORDER BY we.created_at DESC").bind(user.id).all()]);
    return json({ vehicles: result.results || [], installations: installations.results || [], maintenanceHistory: maintenanceHistory.results || [] });
  } catch (error) {
    return handleError(error);
  }
}
