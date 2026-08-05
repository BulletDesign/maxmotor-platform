import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json } from "../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, env.DB, ["customer"]);
    await env.DB.prepare("INSERT INTO notification_reads(notification_id,user_id) SELECT ?1,?2 WHERE EXISTS(SELECT 1 FROM notifications WHERE id=?1 AND active=1 AND datetime(expires_at)>CURRENT_TIMESTAMP) ON CONFLICT(notification_id,user_id) DO UPDATE SET read_at=CURRENT_TIMESTAMP").bind(params.id, user.id).run();
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const notification = await env.DB.prepare("SELECT id,title FROM notifications WHERE id=?1").bind(params.id).first();
    if (!notification) throw new HttpError(404, "Notificacion no encontrada");
    await env.DB.batch([
      env.DB.prepare("DELETE FROM notifications WHERE id=?1").bind(params.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'notification.delete','notification',?3,?4)").bind(crypto.randomUUID(), actor.id, params.id, JSON.stringify({ title: notification.title })),
    ]);
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}
