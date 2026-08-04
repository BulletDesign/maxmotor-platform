import { deleteSession, requireUser } from "../../_lib/auth.js";
import { deleteCustomerData } from "../../_lib/customer-data.js";
import { hashPassword, verifyPassword } from "../../_lib/crypto.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireUser(request, env.DB, ["customer"]);
    return json({ account: { customerCode: user.customerCode, fullName: user.fullName, email: user.email, phone: user.phone } });
  } catch (error) { return handleError(error); }
}

export async function onRequestPatch({ request, env }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, env.DB, ["customer"]);
    const body = await readJson(request);
    const currentPassword = String(body.currentPassword || "");
    const email = String(body.email || user.email).trim().toLowerCase();
    const newPassword = String(body.newPassword || "");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Correo invalido");
    if (newPassword && newPassword.length < 10) throw new HttpError(400, "La nueva contrasena debe tener al menos 10 caracteres");
    const secured = await env.DB.prepare("SELECT password_hash passwordHash,password_salt passwordSalt FROM users WHERE id=?1 AND role='customer'").bind(user.id).first();
    if (!secured || !await verifyPassword(currentPassword, secured.passwordHash, secured.passwordSalt)) throw new HttpError(401, "La contrasena actual no es correcta");
    const duplicate = await env.DB.prepare("SELECT id FROM users WHERE email=?1 COLLATE NOCASE AND id!=?2").bind(email, user.id).first();
    if (duplicate) throw new HttpError(409, "Ese correo ya esta registrado");

    const statements = [
      env.DB.prepare("UPDATE users SET email=?1,updated_at=CURRENT_TIMESTAMP WHERE id=?2 AND role='customer'").bind(email, user.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'account.update','user',?2,?3)").bind(crypto.randomUUID(), user.id, JSON.stringify({ emailChanged: email !== user.email, passwordChanged: Boolean(newPassword) })),
    ];
    let clearCookie = null;
    if (newPassword) {
      const password = await hashPassword(newPassword);
      statements.unshift(env.DB.prepare("UPDATE users SET password_hash=?1,password_salt=?2,must_change_password=0,updated_at=CURRENT_TIMESTAMP WHERE id=?3 AND role='customer'").bind(password.hash, password.salt, user.id));
      statements.push(env.DB.prepare("DELETE FROM sessions WHERE user_id=?1").bind(user.id));
      clearCookie = await deleteSession(request, env.DB, "customer");
    }
    await env.DB.batch(statements);
    return json({ ok: true, signedOut: Boolean(newPassword) }, 200, clearCookie ? { "set-cookie": clearCookie } : {});
  } catch (error) { return handleError(error); }
}

export async function onRequestDelete({ request, env }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, env.DB, ["customer"]);
    const body = await readJson(request);
    if (String(body.confirmation || "") !== "ELIMINAR") throw new HttpError(400, "Escribe ELIMINAR para confirmar");
    const secured = await env.DB.prepare("SELECT password_hash passwordHash,password_salt passwordSalt FROM users WHERE id=?1").bind(user.id).first();
    if (!secured || !await verifyPassword(String(body.currentPassword || ""), secured.passwordHash, secured.passwordSalt)) throw new HttpError(401, "La contrasena actual no es correcta");
    const cookie = await deleteSession(request, env.DB, "customer");
    await deleteCustomerData(env.DB, user.id);
    return json({ ok: true }, 200, { "set-cookie": cookie });
  } catch (error) { return handleError(error); }
}
