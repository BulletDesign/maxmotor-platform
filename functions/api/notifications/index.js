import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    const requestedRole = new URL(request.url).searchParams.get("role") || "customer";
    const roles = ["customer", "employee", "superadmin"].includes(requestedRole) ? [requestedRole] : ["customer"];
    const user = await requireUser(request, env.DB, roles);
    await env.DB.prepare("DELETE FROM notifications WHERE datetime(expires_at)<=CURRENT_TIMESTAMP").run();
    if (user.role === "customer") {
      const result = await env.DB.prepare("SELECT n.id,n.title,n.body,n.published_at publishedAt,n.expires_at expiresAt,CASE WHEN nr.user_id IS NULL THEN 0 ELSE 1 END isRead FROM notifications n LEFT JOIN notification_reads nr ON nr.notification_id=n.id AND nr.user_id=?1 WHERE n.active=1 AND datetime(n.expires_at)>CURRENT_TIMESTAMP ORDER BY n.published_at DESC LIMIT 50").bind(user.id).all();
      return json({ notifications: result.results || [] });
    }
    const result = await env.DB.prepare("SELECT n.id,n.title,n.body,n.active,n.published_at publishedAt,n.expires_at expiresAt,u.full_name createdBy FROM notifications n JOIN users u ON u.id=n.created_by ORDER BY n.published_at DESC LIMIT 50").all();
    return json({ notifications: result.results || [] });
  } catch (error) { return handleError(error); }
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const title = String(body.title || "").trim();
    const content = String(body.body || "").trim();
    if (title.length < 3 || title.length > 100) throw new HttpError(400, "El titulo debe tener entre 3 y 100 caracteres");
    if (content.length < 5 || content.length > 1000) throw new HttpError(400, "El mensaje debe tener entre 5 y 1000 caracteres");
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO notifications(id,title,body,created_by,expires_at) VALUES(?1,?2,?3,?4,?5)").bind(id, title, content, actor.id, expiresAt),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id) VALUES(?1,?2,'notification.publish','notification',?3)").bind(crypto.randomUUID(), actor.id, id),
    ]);
    return json({ id, expiresAt }, 201);
  } catch (error) { return handleError(error); }
}
