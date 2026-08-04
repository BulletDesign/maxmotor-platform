import { sha256 } from "./crypto.js";
import { HttpError } from "./http.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function loginFingerprint(request, login, role) {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  return sha256(`${ip}|${String(login).toLowerCase()}|${role}`);
}

export async function assertLoginAllowed(db, fingerprint) {
  await db.prepare("DELETE FROM login_attempts WHERE datetime(updated_at)<datetime('now','-1 day')").run();
  const record = await db.prepare("SELECT attempts,window_started_at windowStartedAt,locked_until lockedUntil FROM login_attempts WHERE fingerprint=?1").bind(fingerprint).first();
  if (record?.lockedUntil && new Date(record.lockedUntil).getTime() > Date.now()) throw new HttpError(429, "Demasiados intentos. Intenta nuevamente en 15 minutos");
}

export async function recordLoginFailure(db, fingerprint) {
  const current = await db.prepare("SELECT attempts,window_started_at windowStartedAt FROM login_attempts WHERE fingerprint=?1").bind(fingerprint).first();
  const withinWindow = current && Date.now() - new Date(current.windowStartedAt).getTime() < WINDOW_MS;
  const attempts = withinWindow ? Number(current.attempts) + 1 : 1;
  const windowStartedAt = withinWindow ? current.windowStartedAt : new Date().toISOString();
  const lockedUntil = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + WINDOW_MS).toISOString() : null;
  await db.prepare("INSERT INTO login_attempts(fingerprint,attempts,window_started_at,locked_until,updated_at) VALUES(?1,?2,?3,?4,CURRENT_TIMESTAMP) ON CONFLICT(fingerprint) DO UPDATE SET attempts=excluded.attempts,window_started_at=excluded.window_started_at,locked_until=excluded.locked_until,updated_at=CURRENT_TIMESTAMP").bind(fingerprint, attempts, windowStartedAt, lockedUntil).run();
}

export async function clearLoginFailures(db, fingerprint) {
  await db.prepare("DELETE FROM login_attempts WHERE fingerprint=?1").bind(fingerprint).run();
}
