import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["employee", "superadmin"]);
    const [customers, vehicles, warranties, points, recent] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) total FROM users WHERE role='customer' AND status='active'").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM vehicles").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM warranties WHERE status='active'").first(),
      env.DB.prepare("SELECT COALESCE(SUM(points),0) total FROM points_ledger").first(),
      env.DB.prepare("SELECT action,entity_type AS entityType,created_at AS createdAt FROM audit_log ORDER BY created_at DESC LIMIT 8").all()
    ]);
    return json({ stats:{customers:customers.total,vehicles:vehicles.total,warranties:warranties.total,points:points.total},recent:recent.results||[] });
  } catch (error) { return handleError(error); }
}
