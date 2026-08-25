import { requireUser } from "../../_lib/auth.js";
import { hashPassword } from "../../_lib/crypto.js";
import { customerCredentialsMessage } from "../../_lib/customer-credentials.js";
import { createFriendlyCustomerCode, generateTemporaryPassword, normalizeWhatsappPhone } from "../../_lib/customer-identity.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";
import { isWelcomePointsEligible, WELCOME_POINTS_AMOUNT } from "../../_lib/promotions.js";

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["employee", "superadmin"]);
    const query = new URL(request.url).searchParams.get("q")?.trim() || "";
    const like = `%${query}%`;
    const result = await env.DB.prepare("SELECT u.id,u.customer_code AS customerCode,u.full_name AS fullName,u.email,u.phone,u.status,(SELECT COUNT(*) FROM vehicles v WHERE v.user_id=u.id) AS vehicleCount,(SELECT COALESCE(SUM(points),0) FROM points_ledger p WHERE p.user_id=u.id) AS points FROM users u WHERE u.role='customer' AND (?1='' OR u.full_name LIKE ?2 OR u.customer_code LIKE ?2 OR u.email LIKE ?2 OR u.phone LIKE ?2 OR EXISTS(SELECT 1 FROM vehicles v WHERE v.user_id=u.id AND v.plate LIKE ?2)) ORDER BY u.created_at DESC LIMIT 50").bind(query,like).all();
    return json({ customers: result.results || [] });
  } catch (error) { return handleError(error); }
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const originProvince = String(body.originProvince || "").trim();
    const vehicle = body.vehicle || {};
    const brand = String(vehicle.brand || "").trim();
    const model = String(vehicle.model || "").trim();
    const modelYear = Number(vehicle.modelYear) || null;
    const plate = String(vehicle.plate || "").trim().toUpperCase();
    if (fullName.length < 3) throw new HttpError(400, "Nombre completo requerido");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Correo invalido");
    if (originProvince.length < 3) throw new HttpError(400, "Provincia requerida");
    if (!brand || !model) throw new HttpError(400, "Vehiculo requerido");
    if (modelYear && (modelYear < 1950 || modelYear > new Date().getFullYear() + 1)) throw new HttpError(400, "Ano de vehiculo invalido");
    if (body.consent !== true) throw new HttpError(400, "Confirma la autorizacion integral del cliente para datos y comunicaciones por WhatsApp");
    const whatsappPhone = normalizeWhatsappPhone(phone);
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?1").bind(email).first();
    if (existing) throw new HttpError(409, "El correo ya esta registrado");

    const id = crypto.randomUUID();
    const vehicleId = crypto.randomUUID();
    const customerCode = await createFriendlyCustomerCode(env.DB);
    const temporaryPassword = generateTemporaryPassword(customerCode);
    const secured = await hashPassword(temporaryPassword);
    const welcomePoints = isWelcomePointsEligible() ? WELCOME_POINTS_AMOUNT : 0;
    const welcomeCoupon = welcomePoints > 0 ? `MAX10-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}` : null;
    const statements = [
      env.DB.prepare("INSERT INTO users(id,customer_code,email,full_name,phone,password_hash,password_salt,national_id,birth_date,origin_province,origin_canton,created_by,must_change_password) VALUES(?1,?2,?3,?4,?5,?6,?7,NULL,NULL,?8,NULL,?9,1)").bind(id, customerCode, email, fullName, phone, secured.hash, secured.salt, originProvince, actor.id),
      env.DB.prepare("INSERT INTO vehicles(id,user_id,brand,model,model_year,plate,vin,odometer_km) VALUES(?1,?2,?3,?4,?5,?6,NULL,NULL)").bind(vehicleId, id, brand, model, modelYear, plate),
      env.DB.prepare("INSERT INTO consents(id,user_id,consent_type,version) VALUES(?1,?2,'privacy','2026-08-15-integral-v1')").bind(crypto.randomUUID(), id),
      env.DB.prepare("INSERT INTO consents(id,user_id,consent_type,version) VALUES(?1,?2,'whatsapp_service','2026-08-15-integral-v1')").bind(crypto.randomUUID(), id),
      env.DB.prepare("INSERT INTO consents(id,user_id,consent_type,version) VALUES(?1,?2,'marketing','2026-08-15-integral-v1')").bind(crypto.randomUUID(), id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'customer.staff_create','user',?3,?4)").bind(crypto.randomUUID(), actor.id, id, JSON.stringify({ customerCode, vehicleId, originProvince, consentVersion: "2026-08-15-integral-v1", purposes: ["privacy", "whatsapp_service", "marketing"] })),
    ];
    if (welcomePoints > 0) {
      statements.push(
        env.DB.prepare("INSERT INTO points_ledger(id,user_id,movement_type,points,description,created_by) VALUES(?1,?2,'adjust',?3,'Bienvenida MiMaxmotor',?4)").bind(crypto.randomUUID(), id, welcomePoints, actor.id),
        env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'welcome.points','user',?3,?4)").bind(crypto.randomUUID(), actor.id, id, JSON.stringify({ points: welcomePoints, campaignEndsAt: "2026-12-31" })),
        env.DB.prepare("INSERT INTO coupons(id,user_id,code,discount_percent,terms,expires_at) VALUES(?1,?2,?3,10,'10% OFF en productos seleccionados. Valido una vez y sujeto a disponibilidad.',datetime('now','+90 days'))").bind(crypto.randomUUID(), id, welcomeCoupon),
      );
    }
    await env.DB.batch(statements);
    const message = customerCredentialsMessage({ fullName, customerCode, email, temporaryPassword, welcomePoints, welcomeCoupon });
    return json({
      customer: { id, customerCode, fullName, email, phone, vehicleId },
      credentials: { login: email, temporaryPassword },
      welcomePoints,
      welcomeCoupon,
      whatsappUrl: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
    }, 201);
  } catch (error) { return handleError(error); }
}
