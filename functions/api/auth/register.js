import { hashPassword } from "../../_lib/crypto.js";
import { createSession } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request); const body = await readJson(request);
    const email = String(body.email || "").trim().toLowerCase(); const fullName = String(body.fullName || "").trim(); const password = String(body.password || "");
    const nationalId = String(body.nationalId || "").replace(/\D/g, "");
    const birthDate = String(body.birthDate || "").trim();
    const originProvince = String(body.originProvince || "").trim();
    const originCanton = String(body.originCanton || "").trim();
    const wantsWelcomeOffer = body.welcomeOffer === true;
    const vehicle = body.vehicle || {};
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Correo invalido");
    if (fullName.length < 3) throw new HttpError(400, "Nombre requerido");
    if (password.length < 10) throw new HttpError(400, "La contrasena debe tener al menos 10 caracteres");
    if (nationalId.length !== 10) throw new HttpError(400, "Cedula invalida");
    const parsedBirthDate = new Date(`${birthDate}T12:00:00Z`);
    const adultLimit = new Date(); adultLimit.setUTCFullYear(adultLimit.getUTCFullYear() - 18);
    const latestAdultBirthDate = adultLimit.toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(parsedBirthDate.getTime()) || birthDate > latestAdultBirthDate) throw new HttpError(400, "Debes registrar una fecha de nacimiento valida y ser mayor de edad");
    if (originProvince.length < 3 || originCanton.length < 2) throw new HttpError(400, "Provincia y canton requeridos");
    if (!String(vehicle.brand || "").trim() || !String(vehicle.model || "").trim()) throw new HttpError(400, "Vehiculo requerido");
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?1 OR national_id=?2").bind(email,nationalId).first(); if (existing) throw new HttpError(409, "El correo o la cedula ya estan registrados");
    const id = crypto.randomUUID(); const customerCode = `MXR-${id.slice(0, 8).toUpperCase()}`; const secured = await hashPassword(password);
    const vehicleId = crypto.randomUUID();
    const statements = [
      env.DB.prepare("INSERT INTO users (id,customer_code,email,full_name,phone,password_hash,password_salt,national_id,birth_date,origin_province,origin_canton) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)").bind(id,customerCode,email,fullName,String(body.phone||"").trim(),secured.hash,secured.salt,nationalId,birthDate,originProvince,originCanton),
      env.DB.prepare("INSERT INTO vehicles (id,user_id,brand,model,model_year,plate,vin,odometer_km) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)").bind(vehicleId,id,String(vehicle.brand).trim(),String(vehicle.model).trim(),Number(vehicle.modelYear)||null,String(vehicle.plate||"").trim().toUpperCase(),String(vehicle.vin||"").trim().toUpperCase(),Number(vehicle.odometerKm)||0),
      env.DB.prepare("INSERT INTO consents (id,user_id,consent_type,version) VALUES (?1,?2,'privacy','2026-08-04')").bind(crypto.randomUUID(),id)
    ];
    let welcomeCoupon = null;
    if (wantsWelcomeOffer) {
      welcomeCoupon = `MAX10-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
      statements.push(
        env.DB.prepare("INSERT INTO coupons(id,user_id,code,discount_percent,terms,expires_at) VALUES(?1,?2,?3,10,'10% OFF en productos seleccionados. Valido una vez y sujeto a disponibilidad.',datetime('now','+90 days'))").bind(crypto.randomUUID(), id, welcomeCoupon),
        env.DB.prepare("INSERT INTO points_ledger(id,user_id,movement_type,points,description,created_by) VALUES(?1,?2,'adjust',100,'Bienvenida MiMaxmotor',?2)").bind(crypto.randomUUID(), id),
        env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'welcome.offer','user',?2,?3)").bind(crypto.randomUUID(), id, JSON.stringify({ coupon: welcomeCoupon, points: 100 }))
      );
    }
    await env.DB.batch(statements);
    const session = await createSession(env.DB, id, request.url);
    return json({ user: { id, customerCode, email, fullName, role: "customer" }, welcomeCoupon }, 201, { "set-cookie": session.cookie });
  } catch (error) { return handleError(error); }
}
