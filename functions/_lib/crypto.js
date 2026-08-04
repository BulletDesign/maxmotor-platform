const encoder = new TextEncoder();

function toBase64(bytes) { return btoa(String.fromCharCode(...bytes)); }
function fromBase64(value) { return Uint8Array.from(atob(value), char => char.charCodeAt(0)); }

export function randomToken(bytes = 32) { const value = crypto.getRandomValues(new Uint8Array(bytes)); return toBase64(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""); }

export async function hashPassword(password, saltBase64 = null) {
  const salt = saltBase64 ? fromBase64(saltBase64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return { hash: toBase64(new Uint8Array(bits)), salt: toBase64(salt) };
}

export async function verifyPassword(password, expectedHash, salt) {
  const result = await hashPassword(password, salt);
  const left = fromBase64(result.hash); const right = fromBase64(expectedHash);
  if (left.length !== right.length) return false;
  let difference = 0; for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function sha256(value) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value)); return toBase64(new Uint8Array(digest)); }
