import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const requestedRole = new URL(request.url).searchParams.get("role") || "customer";
    const roles = ["customer", "employee", "superadmin"].includes(requestedRole) ? [requestedRole] : ["customer"];
    const user = await requireUser(request, env.DB, roles);
    const privileged = ["employee", "superadmin"].includes(user.role);
    const statement = env.DB.prepare(`SELECT rd.id,rd.user_id userId,rd.reward_name name,rd.reward_price_cents priceCents,rd.cash_after_points_cents cashAfterPointsCents,rd.points_reserved pointsCost,rd.fulfillment_type fulfillmentType,rd.product_id productId,rd.installation_id installationId,rd.status,rd.created_at createdAt${privileged ? ",u.full_name fullName,u.customer_code customerCode" : ""} FROM redemptions rd ${privileged ? "JOIN users u ON u.id=rd.user_id" : ""} ${privileged ? "" : "WHERE rd.user_id=?1"} ORDER BY rd.created_at DESC LIMIT 100`);
    const data = privileged ? await statement.all() : await statement.bind(user.id).all();
    let vehicles = [];
    if (privileged) vehicles = (await env.DB.prepare("SELECT DISTINCT v.id,v.user_id userId,v.brand,v.model,v.plate,v.odometer_km odometerKm FROM vehicles v JOIN redemptions rd ON rd.user_id=v.user_id WHERE rd.status='pending_delivery' ORDER BY v.brand,v.model").all()).results || [];
    return json({ redemptions: data.results || [], vehicles });
  } catch (error) { return handleError(error); }
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, env.DB, ["customer"]);
    const body = await readJson(request);
    const reward = await env.DB.prepare("SELECT id,name,points_cost pointsCost,stock_limit stockLimit,price_cents priceCents,cash_after_points_cents cashAfterPointsCents,fulfillment_type fulfillmentType,product_id productId FROM rewards WHERE id=?1 AND active=1").bind(body.rewardId).first();
    if (!reward) throw new HttpError(404, "Recompensa no disponible");
    const balance = await env.DB.prepare("SELECT COALESCE(SUM(points),0)-(SELECT COALESCE(SUM(points_reserved),0) FROM redemptions WHERE user_id=?1 AND status='requested') balance FROM points_ledger WHERE user_id=?1").bind(user.id).first();
    if (balance.balance < reward.pointsCost) throw new HttpError(409, "Traction Points insuficientes");
    if (reward.stockLimit > 0) {
      const used = await env.DB.prepare("SELECT COUNT(*) total FROM redemptions WHERE reward_id=?1 AND status IN ('requested','pending_delivery','claimed')").bind(reward.id).first();
      if (used.total >= reward.stockLimit) throw new HttpError(409, "Recompensa agotada");
    }
    const id = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO redemptions(id,user_id,reward_id,reward_name,reward_price_cents,cash_after_points_cents,fulfillment_type,product_id,points_reserved) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9)").bind(id, user.id, reward.id, reward.name, reward.priceCents, reward.cashAfterPointsCents, reward.fulfillmentType, reward.productId, reward.pointsCost),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id) VALUES(?1,?2,'redemption.request','redemption',?3)").bind(crypto.randomUUID(), user.id, id),
    ]);
    return json({ id, status: "requested" }, 201);
  } catch (error) { return handleError(error); }
}
