export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
}

export async function readJson(request) {
  const type = request.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new HttpError(415, "Content-Type debe ser application/json");
  try { return await request.json(); } catch { throw new HttpError(400, "JSON invalido"); }
}

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

export function handleError(error) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(error);
  return json({ error: "Error interno" }, 500);
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new HttpError(403, "Origen no permitido");
}
