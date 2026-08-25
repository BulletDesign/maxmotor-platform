import { requireUser } from "../../../../_lib/auth.js";
import { hashPassword } from "../../../../_lib/crypto.js";
import { customerCredentialsMessage } from "../../../../_lib/customer-credentials.js";
import { generateTemporaryPassword, normalizeWhatsappPhone } from "../../../../_lib/customer-identity.js";
import { assertSameOrigin, handleError, HttpError, json } from "../../../../_lib/http.js";

export async function onRequestPost({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const customer = await env.DB.prepare("SELECT id,customer_code customerCode,full_name fullName,email,phone,status FROM users WHERE id=?1 AND role='customer'").bind(params.id).first();
    if (!customer) throw new HttpError(404, "Cliente no encontrado");
    if (customer.status !== "active") throw new HttpError(409, "Activa la cuenta antes de reenviar credenciales");

    const whatsappPhone = normalizeWhatsappPhone(customer.phone);
    const temporaryPassword = generateTemporaryPassword(customer.customerCode);
    const secured = await hashPassword(temporaryPassword);
    const coupon = await env.DB.prepare("SELECT code FROM coupons WHERE user_id=?1 AND status IN ('available','requested') AND datetime(expires_at)>CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1").bind(customer.id).first();
    const welcome = await env.DB.prepare("SELECT COALESCE(SUM(points),0) points FROM points_ledger WHERE user_id=?1 AND description='Bienvenida MiMaxmotor'").bind(customer.id).first();

    await env.DB.batch([
      env.DB.prepare("UPDATE users SET password_hash=?1,password_salt=?2,must_change_password=1,updated_at=CURRENT_TIMESTAMP WHERE id=?3 AND role='customer'").bind(secured.hash, secured.salt, customer.id),
      env.DB.prepare("DELETE FROM sessions WHERE user_id=?1").bind(customer.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'customer.credentials_resend','user',?3,?4)").bind(crypto.randomUUID(), actor.id, customer.id, JSON.stringify({ customerCode: customer.customerCode, channel: "whatsapp", sessionsRevoked: true })),
    ]);

    const message = customerCredentialsMessage({
      fullName: customer.fullName,
      customerCode: customer.customerCode,
      email: customer.email,
      temporaryPassword,
      welcomePoints: Number(welcome?.points || 0),
      welcomeCoupon: coupon?.code || null,
    });
    return json({ ok: true, message, whatsappUrl: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}` });
  } catch (error) { return handleError(error); }
}
