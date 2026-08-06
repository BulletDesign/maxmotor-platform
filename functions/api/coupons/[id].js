import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const status = String(body.status || "");
    if (!["accepted", "rejected", "redeemed"].includes(status)) throw new HttpError(400, "Estado de cupon invalido");
    const coupon = await env.DB.prepare("SELECT id,status,expires_at expiresAt FROM coupons WHERE id=?1").bind(params.id).first();
    if (!coupon) throw new HttpError(404, "Cupon no encontrado");
    if (coupon.expiresAt && Date.parse(coupon.expiresAt) <= Date.now() && status !== "rejected") throw new HttpError(409, "El cupon esta vencido");
    const transitions = { available: ["accepted", "rejected"], requested: ["accepted", "rejected"], accepted: ["redeemed", "rejected"], redeemed: [], rejected: [], expired: [], void: [] };
    if (!transitions[coupon.status]?.includes(status)) throw new HttpError(409, "Transicion de cupon no permitida");
    await env.DB.batch([
      env.DB.prepare("UPDATE coupons SET status=?1,reviewed_by=?2,reviewed_at=CURRENT_TIMESTAMP,redeemed_at=CASE WHEN ?1='redeemed' THEN CURRENT_TIMESTAMP ELSE redeemed_at END WHERE id=?3").bind(status, actor.id, params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'coupon.review','coupon',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ previous: coupon.status, status })),
    ]);
    return json({ ok: true, status });
  } catch (error) { return handleError(error); }
}
