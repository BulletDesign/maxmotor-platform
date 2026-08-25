import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

const MAX_ADJUSTMENT = 1_000_000;

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["superadmin"]);
    const query = new URL(request.url).searchParams.get("q")?.trim() || "";
    if (query.length < 2) return json({ customers: [] });
    const like = `%${query}%`;
    const result = await env.DB.prepare(`
      SELECT u.id,u.customer_code customerCode,u.full_name fullName,u.email,u.phone,u.status,
        COALESCE((SELECT SUM(pl.points) FROM points_ledger pl WHERE pl.user_id=u.id),0) balance,
        COALESCE((SELECT SUM(r.points_reserved) FROM redemptions r WHERE r.user_id=u.id AND r.status='requested'),0) pendingReserved
      FROM users u
      WHERE u.role='customer' AND (u.customer_code LIKE ?1 OR u.full_name LIKE ?1 OR u.email LIKE ?1 OR u.phone LIKE ?1)
      ORDER BY CASE WHEN u.customer_code=?2 THEN 0 ELSE 1 END,u.full_name
      LIMIT 12
    `).bind(like, query.toUpperCase()).all();
    return json({ customers: (result.results || []).map((customer) => ({
      ...customer,
      available: Number(customer.balance || 0) - Number(customer.pendingReserved || 0),
    })) });
  } catch (error) { return handleError(error); }
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["superadmin"]);
    const body = await readJson(request);
    const customerId = String(body.customerId || "");
    const direction = String(body.direction || "");
    const points = Number(body.points);
    const reason = String(body.reason || "").trim();
    if (!customerId || !["add", "remove"].includes(direction)) throw new HttpError(400, "Cliente y operacion requeridos");
    if (!Number.isInteger(points) || points < 1 || points > MAX_ADJUSTMENT) throw new HttpError(400, "Ingresa entre 1 y 1.000.000 TP");
    if (reason.length < 8 || reason.length > 300) throw new HttpError(400, "Escribe un motivo de 8 a 300 caracteres");

    const customer = await env.DB.prepare(`
      SELECT u.id,u.customer_code customerCode,u.full_name fullName,u.status,
        COALESCE((SELECT SUM(pl.points) FROM points_ledger pl WHERE pl.user_id=u.id),0) balance,
        COALESCE((SELECT SUM(r.points_reserved) FROM redemptions r WHERE r.user_id=u.id AND r.status='requested'),0) pendingReserved
      FROM users u WHERE u.id=?1 AND u.role='customer'
    `).bind(customerId).first();
    if (!customer) throw new HttpError(404, "Cliente no encontrado");
    if (customer.status === "closed") throw new HttpError(409, "No se puede ajustar una cuenta eliminada");
    const balanceBefore = Number(customer.balance || 0);
    const pendingReserved = Number(customer.pendingReserved || 0);
    const availableBefore = balanceBefore - pendingReserved;
    const delta = direction === "add" ? points : -points;
    if (delta < 0 && points > availableBefore) throw new HttpError(409, `El cliente solo tiene ${availableBefore} TP disponibles`);
    const balanceAfter = balanceBefore + delta;
    const availableAfter = balanceAfter - pendingReserved;
    const ledgerId = crypto.randomUUID();

    await env.DB.batch([
      env.DB.prepare("INSERT INTO points_ledger(id,user_id,movement_type,points,description,created_by) VALUES(?1,?2,'adjust',?3,?4,?5)").bind(ledgerId, customer.id, delta, `Ajuste Superadmin: ${reason}`, actor.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'points.adjust','points_ledger',?3,?4)").bind(crypto.randomUUID(), actor.id, ledgerId, JSON.stringify({ customerId: customer.id, customerCode: customer.customerCode, reason, delta, balanceBefore, balanceAfter, pendingReserved, availableBefore, availableAfter })),
    ]);
    return json({ ok: true, customer: { id: customer.id, customerCode: customer.customerCode, fullName: customer.fullName }, delta, balance: balanceAfter, pendingReserved, available: availableAfter });
  } catch (error) { return handleError(error); }
}
