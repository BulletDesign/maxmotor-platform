import { requireUser } from "../../_lib/auth.js";
import { hashPassword } from "../../_lib/crypto.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["superadmin"]);
    const result = await env.DB.prepare("SELECT u.id,u.customer_code customerCode,COALESCE(li.identifier,u.email) email,u.full_name fullName,u.job_title jobTitle,u.role,u.status,u.must_change_password mustChangePassword,u.created_at createdAt FROM users u LEFT JOIN role_login_identifiers li ON li.user_id=u.id AND li.role=u.role WHERE u.role IN ('employee','superadmin') ORDER BY CASE u.role WHEN 'superadmin' THEN 0 ELSE 1 END,u.full_name").all();
    return json({ team: result.results || [] });
  } catch (error) { return handleError(error); }
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["superadmin"]);
    const body = await readJson(request);
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const jobTitle = String(body.jobTitle || "Asesor Maxmotor").trim();
    const password = String(body.password || "");
    if (fullName.length < 3 || !/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Nombre y correo validos son obligatorios");
    if (password.length < 8) throw new HttpError(400, "La clave temporal debe tener al menos 8 caracteres");
    if (await env.DB.prepare("SELECT id FROM role_login_identifiers WHERE identifier=?1 COLLATE NOCASE AND role='employee'").bind(email).first()) throw new HttpError(409, "Ese usuario de empleado ya existe");
    const id = crypto.randomUUID();
    const secured = await hashPassword(password);
    const customerCode = `STAFF-${id.slice(0, 8).toUpperCase()}`;
    const internalEmail = `staff-${id}@accounts.maxmotor.local`;
    await env.DB.batch([
      env.DB.prepare("INSERT INTO users(id,customer_code,email,full_name,password_hash,password_salt,role,status,must_change_password,job_title,created_by) VALUES(?1,?2,?3,?4,?5,?6,'employee','active',0,?7,?8)").bind(id, customerCode, internalEmail, fullName, secured.hash, secured.salt, jobTitle, actor.id),
      env.DB.prepare("INSERT INTO role_login_identifiers(id,user_id,identifier,role) VALUES(?1,?2,?3,'employee')").bind(crypto.randomUUID(), id, email),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'staff.create','user',?3,?4)").bind(crypto.randomUUID(), actor.id, id, JSON.stringify({ fullName, email, jobTitle, role: "employee" })),
    ]);
    return json({ id, customerCode }, 201);
  } catch (error) { return handleError(error); }
}
