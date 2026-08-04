import { requireUser } from "../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const current = await env.DB.prepare("SELECT name,active FROM product_families WHERE id=?1").bind(params.id).first();
    if (!current) throw new HttpError(404, "Familia no encontrada");
    const name = String(body.name ?? current.name).trim();
    const active = body.active === undefined ? Number(current.active) : Number(Boolean(body.active));
    if (name.length < 3) throw new HttpError(400, "Nombre de familia requerido");
    await env.DB.batch([
      env.DB.prepare("UPDATE product_families SET name=?1,active=?2 WHERE id=?3").bind(name, active, params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'family.update','product_family',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ name, active })),
    ]);
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}
