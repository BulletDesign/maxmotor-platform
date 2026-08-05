import { requireUser } from "../../../_lib/auth.js";
import { hashPassword } from "../../../_lib/crypto.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare("SELECT u.id,COALESCE(li.identifier,u.email) email,u.full_name fullName,u.job_title jobTitle,u.status,u.role FROM users u LEFT JOIN role_login_identifiers li ON li.user_id=u.id AND li.role=u.role WHERE u.id=?1").bind(params.id).first();
    if (!current || current.role !== "employee") throw new HttpError(404, "Empleado no encontrado");
    const email = String(body.email ?? current.email).trim().toLowerCase();
    const fullName = String(body.fullName ?? current.fullName).trim();
    const jobTitle = String(body.jobTitle ?? current.jobTitle ?? "Asesor Maxmotor").trim();
    const status = body.status === undefined ? current.status : String(body.status);
    if (!/^\S+@\S+\.\S+$/.test(email) || fullName.length < 3 || !["active", "suspended"].includes(status)) throw new HttpError(400, "Datos de empleado invalidos");
    const duplicate = await env.DB.prepare("SELECT user_id userId FROM role_login_identifiers WHERE identifier=?1 COLLATE NOCASE AND role='employee' AND user_id!=?2").bind(email, params.id).first();
    if (duplicate) throw new HttpError(409, "Ese usuario de empleado ya existe");
    const statements = [
      env.DB.prepare("UPDATE users SET full_name=?1,job_title=?2,status=?3,updated_at=CURRENT_TIMESTAMP WHERE id=?4 AND role='employee'").bind(fullName, jobTitle, status, params.id),
      env.DB.prepare("INSERT INTO role_login_identifiers(id,user_id,identifier,role) VALUES(?1,?2,?3,'employee') ON CONFLICT(user_id) DO UPDATE SET identifier=excluded.identifier,role='employee'").bind(crypto.randomUUID(), params.id, email),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'staff.update','user',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ email, fullName, jobTitle, status, passwordReset: Boolean(body.password) })),
    ];
    if (body.password !== undefined && String(body.password).length) {
      const password = String(body.password);
      if (password.length < 8) throw new HttpError(400, "La nueva clave debe tener al menos 8 caracteres");
      const secured = await hashPassword(password);
      statements.splice(1, 0, env.DB.prepare("UPDATE users SET password_hash=?1,password_salt=?2,must_change_password=0,updated_at=CURRENT_TIMESTAMP WHERE id=?3").bind(secured.hash, secured.salt, params.id));
    }
    statements.push(env.DB.prepare("DELETE FROM sessions WHERE user_id=?1").bind(params.id));
    await env.DB.batch(statements);
    return json({ ok: true, status });
  } catch (error) { return handleError(error); }
}
