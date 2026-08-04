import { HttpError } from "./http.js";
import { randomToken, sha256 } from "./crypto.js";

const COOKIE = "mxr_session";
const MAX_AGE = 60 * 60 * 24 * 14;

function cookieValue(request, name) {
  const cookies = request.headers.get("cookie") || "";
  return cookies.split(";").map(item => item.trim().split("=")).find(([key]) => key === name)?.[1] || null;
}

export async function createSession(db, userId, requestUrl) {
  const token = randomToken(); const tokenHash = await sha256(token); const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000).toISOString();
  await db.prepare("INSERT INTO sessions (id,user_id,token_hash,expires_at) VALUES (?1,?2,?3,?4)").bind(id, userId, tokenHash, expiresAt).run();
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return { token, cookie: `${COOKIE}=${token}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${MAX_AGE}` };
}

export async function currentUser(request, db) {
  const token = cookieValue(request, COOKIE); if (!token) return null;
  const tokenHash = await sha256(token);
  return db.prepare("SELECT u.id,u.customer_code AS customerCode,u.email,u.full_name AS fullName,u.phone,u.role,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?1 AND datetime(s.expires_at)>CURRENT_TIMESTAMP AND u.status='active'").bind(tokenHash).first();
}

export async function requireUser(request, db, roles = []) {
  const user = await currentUser(request, db); if (!user) throw new HttpError(401, "Sesion requerida");
  if (roles.length && !roles.includes(user.role)) throw new HttpError(403, "Permisos insuficientes");
  return user;
}

export async function deleteSession(request, db) {
  const token = cookieValue(request, COOKIE); if (token) await db.prepare("DELETE FROM sessions WHERE token_hash=?1").bind(await sha256(token)).run();
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
