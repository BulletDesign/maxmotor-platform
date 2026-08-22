import { HttpError } from "./http.js";

export async function createFriendlyCustomerCode(db) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const digits = 10000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 90000);
    const candidate = `MM-${digits}`;
    const existing = await db.prepare("SELECT id FROM users WHERE customer_code=?1").bind(candidate).first();
    if (!existing) return candidate;
  }
  throw new HttpError(503, "No pudimos generar el Maxmotor ID. Intenta nuevamente");
}

export function generateTemporaryPassword(customerCode) {
  const normalizedCode = String(customerCode || "").trim().toUpperCase();
  if (!/^MM-\d{5}$/.test(normalizedCode)) throw new HttpError(500, "Maxmotor ID invalido para generar credenciales");
  return `MXR-${normalizedCode}`;
}

export function normalizeWhatsappPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (/^09\d{8}$/.test(digits)) return `593${digits.slice(1)}`;
  if (/^5939\d{8}$/.test(digits)) return digits;
  throw new HttpError(400, "Registra un celular ecuatoriano valido para enviar las credenciales por WhatsApp");
}
