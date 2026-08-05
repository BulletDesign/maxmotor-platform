import { HttpError } from "./http.js";
import { randomToken, sha256 } from "./crypto.js";

const COOKIE_BY_ROLE = {
  customer: "mxr_customer_session",
  employee: "mxr_employee_session",
  superadmin: "mxr_superadmin_session",
};
const MAX_AGE_BY_ROLE = {
  customer: 60 * 60 * 24 * 14,
  employee: 60 * 60 * 24,
  superadmin: 60 * 60 * 24,
};

function cookieValue(request, name) {
  const cookies = request.headers.get("cookie") || "";
  return cookies.split(";").map((item) => item.trim().split("=")).find(([key]) => key === name)?.[1] || null;
}

function normalizeRoles(roles) {
  const selected = roles.length ? roles : Object.keys(COOKIE_BY_ROLE);
  return selected.filter((role) => COOKIE_BY_ROLE[role]);
}

export async function createSession(db, userId, requestUrl, role = "customer") {
  if (!COOKIE_BY_ROLE[role]) throw new HttpError(400, "Rol de sesion invalido");
  const maxAge = MAX_AGE_BY_ROLE[role];
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString();
  await db.prepare("INSERT INTO sessions (id,user_id,token_hash,expires_at) VALUES (?1,?2,?3,?4)").bind(crypto.randomUUID(), userId, tokenHash, expiresAt).run();
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return { cookie: `${COOKIE_BY_ROLE[role]}=${token}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${maxAge}` };
}

export async function currentUser(request, db, roles = []) {
  for (const expectedRole of normalizeRoles(roles)) {
    const token = cookieValue(request, COOKIE_BY_ROLE[expectedRole]);
    if (!token) continue;
    const user = await db.prepare("SELECT u.id,u.customer_code AS customerCode,u.email,u.full_name AS fullName,u.phone,u.role,u.status,u.job_title AS jobTitle,u.must_change_password AS mustChangePassword FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?1 AND datetime(s.expires_at)>CURRENT_TIMESTAMP AND u.status='active' AND u.role=?2").bind(await sha256(token), expectedRole).first();
    if (user) return user;
  }
  return null;
}

export async function requireUser(request, db, roles = []) {
  const user = await currentUser(request, db, roles);
  if (!user) throw new HttpError(401, "Sesion requerida");
  return user;
}

export async function deleteSession(request, db, role = "customer") {
  if (!COOKIE_BY_ROLE[role]) throw new HttpError(400, "Rol de sesion invalido");
  const token = cookieValue(request, COOKIE_BY_ROLE[role]);
  if (token) await db.prepare("DELETE FROM sessions WHERE token_hash=?1").bind(await sha256(token)).run();
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_BY_ROLE[role]}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
