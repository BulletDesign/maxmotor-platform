import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const role = new URL(request.url).searchParams.get("role") || "customer";
    const roles = ["customer", "employee", "superadmin"].includes(role) ? [role] : ["customer"];
    const user = await requireUser(request, env.DB, roles);
    const privileged = user.role === "employee" || user.role === "superadmin";
    const code = String(new URL(request.url).searchParams.get("code") || "").trim().toUpperCase();
    const result = privileged
      ? await env.DB.prepare("SELECT c.id,c.user_id userId,c.code,c.discount_percent discountPercent,c.terms,c.status,c.expires_at expiresAt,c.created_at createdAt,c.requested_at requestedAt,c.reviewed_at reviewedAt,c.redeemed_at redeemedAt,u.full_name fullName,u.customer_code customerCode FROM coupons c JOIN users u ON u.id=c.user_id WHERE (?1!='' AND c.code=?1) OR (?1='' AND c.status IN ('requested','accepted','redeemed','rejected')) ORDER BY CASE c.status WHEN 'requested' THEN 0 WHEN 'accepted' THEN 1 ELSE 2 END,c.created_at DESC LIMIT 100").bind(code).all()
      : await env.DB.prepare("SELECT id,code,discount_percent discountPercent,terms,status,expires_at expiresAt,created_at createdAt,requested_at requestedAt,reviewed_at reviewedAt,redeemed_at redeemedAt FROM coupons WHERE user_id=?1 ORDER BY created_at DESC").bind(user.id).all();
    return json({ coupons: result.results || [] });
  } catch (error) {
    return handleError(error);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, env.DB, ["customer"]);
    const body = await readJson(request);
    const coupon = await env.DB.prepare("SELECT id,status,expires_at expiresAt FROM coupons WHERE id=?1 AND user_id=?2").bind(String(body.couponId || ""), user.id).first();
    if (!coupon) throw new HttpError(404, "Cupon no encontrado");
    if (coupon.expiresAt && Date.parse(coupon.expiresAt) <= Date.now()) {
      await env.DB.prepare("UPDATE coupons SET status='expired' WHERE id=?1 AND status='available'").bind(coupon.id).run();
      throw new HttpError(409, "Este cupon ya vencio");
    }
    if (coupon.status !== "available") throw new HttpError(409, "Este cupon ya fue solicitado");
    await env.DB.batch([
      env.DB.prepare("UPDATE coupons SET status='requested',requested_at=CURRENT_TIMESTAMP WHERE id=?1 AND user_id=?2").bind(coupon.id, user.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id) VALUES(?1,?2,'coupon.request','coupon',?3)").bind(crypto.randomUUID(), user.id, coupon.id),
    ]);
    return json({ id: coupon.id, status: "requested" }, 201);
  } catch (error) { return handleError(error); }
}
