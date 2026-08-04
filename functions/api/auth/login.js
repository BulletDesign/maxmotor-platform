import { verifyPassword } from "../../_lib/crypto.js";
import { createSession } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request); const body = await readJson(request); const login = String(body.email || body.login || "").trim();
    const user = await env.DB.prepare("SELECT * FROM users WHERE (email=?1 COLLATE NOCASE OR customer_code=?2 COLLATE NOCASE OR (role IN ('employee','superadmin') AND full_name=?2 COLLATE NOCASE)) AND status='active'").bind(login.toLowerCase(),login).first();
    if (!user || !await verifyPassword(String(body.password || ""), user.password_hash, user.password_salt)) throw new HttpError(401, "Credenciales invalidas");
    const session = await createSession(env.DB, user.id, request.url, user.role);
    return json({ user: { id:user.id, customerCode:user.customer_code, email:user.email, fullName:user.full_name, role:user.role, mustChangePassword:Boolean(user.must_change_password) } }, 200, { "set-cookie": session.cookie });
  } catch (error) { return handleError(error); }
}
