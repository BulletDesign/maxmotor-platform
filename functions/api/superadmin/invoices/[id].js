import { requireUser } from "../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../_lib/http.js";
import { pointsForPurchase } from "../../../_lib/points.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare(`SELECT i.id,i.invoice_number invoiceNumber,i.user_id userId,
      i.amount_cents amountCents,i.issued_at issuedAt,i.points_enabled pointsEnabled,
      COALESCE((SELECT SUM(points) FROM points_ledger WHERE invoice_id=i.id),0) currentPoints
      FROM invoices i WHERE i.id=?1`).bind(params.id).first();
    if (!current) throw new HttpError(404, "Factura no encontrada");

    const invoiceNumber = String(body.invoiceNumber ?? current.invoiceNumber).trim().toUpperCase();
    const amountCents = Number(body.amountCents ?? current.amountCents);
    const issuedAt = String(body.issuedAt ?? current.issuedAt);
    const pointsEnabled = body.pointsEnabled === undefined ? Boolean(Number(current.pointsEnabled)) : body.pointsEnabled === true;
    const reason = String(body.reason || "Correccion administrativa").trim();
    if (!invoiceNumber) throw new HttpError(400, "Numero de factura requerido");
    if (!Number.isInteger(amountCents) || amountCents <= 0) throw new HttpError(400, "Valor de factura invalido");
    if (Number.isNaN(new Date(issuedAt).getTime())) throw new HttpError(400, "Fecha de factura invalida");
    if (reason.length < 5) throw new HttpError(400, "Explica el motivo de la correccion");
    const duplicate = await env.DB.prepare("SELECT id FROM invoices WHERE invoice_number=?1 AND id!=?2").bind(invoiceNumber, params.id).first();
    if (duplicate) throw new HttpError(409, "Ese numero de factura ya existe");

    const targetPoints = pointsEnabled ? pointsForPurchase(amountCents) : 0;
    const pointsDelta = targetPoints - Number(current.currentPoints || 0);
    const statements = [
      env.DB.prepare("UPDATE invoices SET invoice_number=?1,amount_cents=?2,issued_at=?3,points_enabled=?4 WHERE id=?5").bind(invoiceNumber, amountCents, issuedAt, Number(pointsEnabled), params.id),
    ];
    if (pointsDelta) {
      statements.push(env.DB.prepare("INSERT INTO points_ledger(id,user_id,invoice_id,movement_type,points,description,created_by) VALUES(?1,?2,?3,'adjust',?4,?5,?6)").bind(crypto.randomUUID(), current.userId, params.id, pointsDelta, `Correccion de factura ${invoiceNumber}: ${reason}`, actor.id));
    }
    statements.push(env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'invoice.correct','invoice',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ reason, before: { invoiceNumber: current.invoiceNumber, amountCents: current.amountCents, issuedAt: current.issuedAt, pointsEnabled: Boolean(Number(current.pointsEnabled)), points: Number(current.currentPoints || 0) }, after: { invoiceNumber, amountCents, issuedAt, pointsEnabled, points: targetPoints }, pointsDelta })));
    await env.DB.batch(statements);
    return json({ ok: true, invoiceNumber, amountCents, issuedAt, pointsEnabled, points: targetPoints, pointsDelta });
  } catch (error) { return handleError(error); }
}
