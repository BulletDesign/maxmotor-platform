import { requireUser } from "../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../_lib/http.js";
import { pointsForPurchase } from "../../../_lib/points.js";

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request); const actor=await requireUser(request,env.DB,["employee","superadmin"]); const body=await readJson(request);
    const amountCents=Number(body.amountCents); const invoiceNumber=String(body.invoiceNumber||"").trim(); const customerCode=String(body.customerCode||"").trim().toUpperCase();
    if (!Number.isInteger(amountCents)||amountCents<=0) throw new HttpError(400,"Monto invalido"); if(!invoiceNumber) throw new HttpError(400,"Factura requerida");
    const customer=await env.DB.prepare("SELECT id FROM users WHERE customer_code=?1 AND role='customer' AND status='active'").bind(customerCode).first(); if(!customer) throw new HttpError(404,"Cliente no encontrado");
    const duplicate=await env.DB.prepare("SELECT id FROM invoices WHERE invoice_number=?1").bind(invoiceNumber).first(); if(duplicate) throw new HttpError(409,"La factura ya fue registrada");
    const points=pointsForPurchase(amountCents); if(points<1) throw new HttpError(400,"La compra no alcanza el minimo para puntos");
    const invoiceId=crypto.randomUUID(); const movementId=crypto.randomUUID(); const auditId=crypto.randomUUID(); const issuedAt=String(body.issuedAt||new Date().toISOString());
    await env.DB.batch([
      env.DB.prepare("INSERT INTO invoices (id,invoice_number,user_id,amount_cents,issued_at,created_by) VALUES (?1,?2,?3,?4,?5,?6)").bind(invoiceId,invoiceNumber,customer.id,amountCents,issuedAt,actor.id),
      env.DB.prepare("INSERT INTO points_ledger (id,user_id,invoice_id,movement_type,points,description,created_by) VALUES (?1,?2,?3,'earn',?4,?5,?6)").bind(movementId,customer.id,invoiceId,points,`Compra factura ${invoiceNumber}`,actor.id),
      env.DB.prepare("INSERT INTO audit_log (id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES (?1,?2,'points.award','invoice',?3,?4)").bind(auditId,actor.id,invoiceId,JSON.stringify({customerCode,invoiceNumber,amountCents,points}))
    ]);
    return json({invoiceId,points},201);
  } catch(error){ return handleError(error); }
}
