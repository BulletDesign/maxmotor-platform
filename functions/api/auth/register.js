import { hashPassword } from "../../_lib/crypto.js";
import { createSession } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request); const body = await readJson(request);
    const email = String(body.email || "").trim().toLowerCase(); const fullName = String(body.fullName || "").trim(); const password = String(body.password || "");
    const nationalId = String(body.nationalId || "").replace(/\D/g, "");
    const vehicle = body.vehicle || {};
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Correo invalido");
    if (fullName.length < 3) throw new HttpError(400, "Nombre requerido");
    if (password.length < 10) throw new HttpError(400, "La contrasena debe tener al menos 10 caracteres");
    if (nationalId.length !== 10) throw new HttpError(400, "Cedula invalida");
    if (!String(vehicle.brand || "").trim() || !String(vehicle.model || "").trim()) throw new HttpError(400, "Vehiculo requerido");
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?1 OR national_id=?2").bind(email,nationalId).first(); if (existing) throw new HttpError(409, "El correo o la cedula ya estan registrados");
    const id = crypto.randomUUID(); const customerCode = `MXR-${id.slice(0, 8).toUpperCase()}`; const secured = await hashPassword(password);
    const vehicleId = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO users (id,customer_code,email,full_name,phone,password_hash,password_salt,national_id) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)").bind(id,customerCode,email,fullName,String(body.phone||"").trim(),secured.hash,secured.salt,nationalId),
      env.DB.prepare("INSERT INTO vehicles (id,user_id,brand,model,model_year,plate,vin,odometer_km) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)").bind(vehicleId,id,String(vehicle.brand).trim(),String(vehicle.model).trim(),Number(vehicle.modelYear)||null,String(vehicle.plate||"").trim().toUpperCase(),String(vehicle.vin||"").trim().toUpperCase(),Number(vehicle.odometerKm)||0),
      env.DB.prepare("INSERT INTO consents (id,user_id,consent_type,version) VALUES (?1,?2,'privacy','2026-08-04')").bind(crypto.randomUUID(),id)
    ]);
    const session = await createSession(env.DB, id, request.url);
    return json({ user: { id, customerCode, email, fullName, role: "customer" } }, 201, { "set-cookie": session.cookie });
  } catch (error) { return handleError(error); }
}
