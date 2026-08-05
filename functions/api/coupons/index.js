import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireUser(request, env.DB, ["customer"]);
    const result = await env.DB.prepare(
      "SELECT id,code,discount_percent discountPercent,terms,status,expires_at expiresAt,created_at createdAt FROM coupons WHERE user_id=?1 ORDER BY created_at DESC"
    ).bind(user.id).all();
    return json({ coupons: result.results || [] });
  } catch (error) {
    return handleError(error);
  }
}
