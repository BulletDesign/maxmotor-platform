import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare("SELECT name,description,points_cost pointsCost,stock_limit stockLimit,price_cents priceCents,cash_after_points_cents cashAfterPointsCents,fulfillment_type fulfillmentType,product_id productId,active FROM rewards WHERE id=?1").bind(params.id).first();
    if (!current) throw new HttpError(404, "Recompensa no encontrada");
    const fulfillmentType = body.fulfillmentType ?? current.fulfillmentType;
    const productId = fulfillmentType === "install" ? String(body.productId ?? current.productId ?? "") : null;
    if (fulfillmentType === "install" && !await env.DB.prepare("SELECT id FROM operational_products WHERE id=?1 AND active=1").bind(productId).first()) throw new HttpError(400, "Selecciona un producto activo para instalar");
    const values = {
      name: String(body.name ?? current.name).trim(), description: String(body.description ?? current.description ?? "").trim(),
      pointsCost: Number(body.pointsCost ?? current.pointsCost), stockLimit: Number(body.stockLimit ?? current.stockLimit),
      priceCents: body.price === undefined ? Number(current.priceCents) : Math.round(Number(body.price) * 100),
      cashAfterPointsCents: body.cashAfterPoints === undefined ? Number(current.cashAfterPointsCents) : Math.round(Number(body.cashAfterPoints) * 100),
      active: body.active === undefined ? Number(current.active) : Number(Boolean(body.active)), fulfillmentType, productId,
    };
    if (!values.name || !Number.isInteger(values.pointsCost) || values.pointsCost <= 0 || !Number.isInteger(values.stockLimit) || values.stockLimit < 0 || values.priceCents < 0 || values.cashAfterPointsCents < 0 || values.cashAfterPointsCents > values.priceCents) throw new HttpError(400, "Recompensa invalida");
    await env.DB.batch([
      env.DB.prepare("UPDATE rewards SET name=?1,description=?2,points_cost=?3,stock_limit=?4,price_cents=?5,cash_after_points_cents=?6,fulfillment_type=?7,product_id=?8,active=?9,updated_at=CURRENT_TIMESTAMP WHERE id=?10").bind(values.name, values.description, values.pointsCost, values.stockLimit, values.priceCents, values.cashAfterPointsCents, values.fulfillmentType, values.productId, values.active, params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id) VALUES(?1,?2,'reward.update','reward',?3)").bind(crypto.randomUUID(), actor.id, params.id),
    ]);
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const reward = await env.DB.prepare("SELECT id,name FROM rewards WHERE id=?1").bind(params.id).first();
    if (!reward) throw new HttpError(404, "Recompensa no encontrada");
    await env.DB.batch([
      env.DB.prepare("DELETE FROM rewards WHERE id=?1").bind(params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'reward.delete','reward',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ permanent: true, name: reward.name })),
    ]);
    return json({ ok: true, deleted: true });
  } catch (error) { return handleError(error); }
}
