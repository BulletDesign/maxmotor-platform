import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["employee", "superadmin"]);
    const query = new URL(request.url).searchParams.get("q")?.trim() || "";
    const like = `%${query}%`;
    const result = await env.DB.prepare("SELECT u.id,u.customer_code AS customerCode,u.full_name AS fullName,u.email,u.phone,u.status,(SELECT COUNT(*) FROM vehicles v WHERE v.user_id=u.id) AS vehicleCount,(SELECT COALESCE(SUM(points),0) FROM points_ledger p WHERE p.user_id=u.id) AS points FROM users u WHERE u.role='customer' AND (?1='' OR u.full_name LIKE ?2 OR u.customer_code LIKE ?2 OR u.email LIKE ?2 OR u.phone LIKE ?2 OR EXISTS(SELECT 1 FROM vehicles v WHERE v.user_id=u.id AND v.plate LIKE ?2)) ORDER BY u.created_at DESC LIMIT 50").bind(query,like).all();
    return json({ customers: result.results || [] });
  } catch (error) { return handleError(error); }
}
