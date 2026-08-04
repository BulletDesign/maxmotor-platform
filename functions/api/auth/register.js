import { hashPassword } from "../../_lib/crypto.js";
import { createSession } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request); const body = await readJson(request);
    const email = String(body.email || "").trim().toLowerCase(); const fullName = String(body.fullName || "").trim(); const password = String(body.password || "");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Correo invalido");
    if (fullName.length < 3) throw new HttpError(400, "Nombre requerido");
    if (password.length < 10) throw new HttpError(400, "La contrasena debe tener al menos 10 caracteres");
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?1").bind(email).first(); if (existing) throw new HttpError(409, "El correo ya esta registrado");
    const id = crypto.randomUUID(); const customerCode = `MXR-${id.slice(0, 8).toUpperCase()}`; const secured = await hashPassword(password);
    await env.DB.prepare("INSERT INTO users (id,customer_code,email,full_name,phone,password_hash,password_salt) VALUES (?1,?2,?3,?4,?5,?6,?7)").bind(id, customerCode, email, fullName, String(body.phone || "").trim(), secured.hash, secured.salt).run();
    const session = await createSession(env.DB, id, request.url);
    return json({ user: { id, customerCode, email, fullName, role: "customer" } }, 201, { "set-cookie": session.cookie });
  } catch (error) { return handleError(error); }
}
