import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare("SELECT name,description,points_cost pointsCost,stock_limit stockLimit,price_cents priceCents,cash_after_points_cents cashAfterPointsCents,active FROM rewards WHERE id=?1").bind(params.id).first();
    if (!current) throw new HttpError(404, "Recompensa no encontrada");
    const name = String(body.name ?? current.name).trim();
    const description = String(body.description ?? current.description ?? "").trim();
    const pointsCost = Number(body.pointsCost ?? current.pointsCost);
    const stockLimit = Number(body.stockLimit ?? current.stockLimit);
    const priceCents = body.price === undefined ? Number(current.priceCents) : Math.round(Number(body.price) * 100);
    const cashAfterPointsCents = body.cashAfterPoints === undefined ? Number(current.cashAfterPointsCents) : Math.round(Number(body.cashAfterPoints) * 100);
    const active = body.active === undefined ? Number(current.active) : Number(Boolean(body.active));
    if (!name || !Number.isInteger(pointsCost) || pointsCost <= 0 || !Number.isInteger(stockLimit) || stockLimit < 0 || priceCents < 0 || cashAfterPointsCents < 0) throw new HttpError(400, "Recompensa invalida");
    await env.DB.batch([
      env.DB.prepare("UPDATE rewards SET name=?1,description=?2,points_cost=?3,stock_limit=?4,price_cents=?5,cash_after_points_cents=?6,active=?7,updated_at=CURRENT_TIMESTAMP WHERE id=?8").bind(name, description, pointsCost, stockLimit, priceCents, cashAfterPointsCents, active, params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id) VALUES(?1,?2,'reward.update','reward',?3)").bind(crypto.randomUUID(), actor.id, params.id),
    ]);
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}
