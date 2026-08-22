import { HttpError } from "./http.js";

export async function deleteVehicleData(db, vehicleId, customerId, actorId) {
  const vehicle = await db.prepare("SELECT id FROM vehicles WHERE id=?1 AND user_id=?2").bind(vehicleId, customerId).first();
  if (!vehicle) throw new HttpError(404, "Vehiculo no encontrado");

  await db.batch([
    db.prepare("DELETE FROM warranty_events WHERE installation_id IN (SELECT id FROM installations WHERE vehicle_id=?1 AND user_id=?2)").bind(vehicleId, customerId),
    db.prepare("DELETE FROM installations WHERE vehicle_id=?1 AND user_id=?2").bind(vehicleId, customerId),
    db.prepare("DELETE FROM warranties WHERE vehicle_id=?1 AND user_id=?2").bind(vehicleId, customerId),
    db.prepare("DELETE FROM vehicles WHERE id=?1 AND user_id=?2").bind(vehicleId, customerId),
    db.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'vehicle.delete','vehicle',?3,?4)").bind(crypto.randomUUID(), actorId, vehicleId, JSON.stringify({ customerId })),
  ]);
}

export async function deleteCustomerData(db, customerId, actorId = null) {
  const customer = await db.prepare("SELECT id FROM users WHERE id=?1 AND role='customer'").bind(customerId).first();
  if (!customer) throw new HttpError(404, "Cliente no encontrado");

  await db.batch([
    db.prepare("DELETE FROM reward_reminder_events WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM reward_reminder_preferences WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM notification_reads WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM coupons WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM warranty_events WHERE installation_id IN (SELECT id FROM installations WHERE user_id=?1)").bind(customerId),
    db.prepare("DELETE FROM installations WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM warranties WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM redemptions WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM points_ledger WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM invoices WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM vehicles WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM consents WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM sessions WHERE user_id=?1").bind(customerId),
    db.prepare("DELETE FROM audit_log WHERE actor_user_id=?1 OR (entity_type='user' AND entity_id=?1)").bind(customerId),
    db.prepare("DELETE FROM users WHERE id=?1 AND role='customer'").bind(customerId),
    db.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id) VALUES(?1,?2,'customer.delete','user',?3)").bind(crypto.randomUUID(), actorId, customerId),
  ]);
}
