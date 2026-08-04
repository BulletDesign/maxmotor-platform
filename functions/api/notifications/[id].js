import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, json } from "../../_lib/http.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, env.DB, ["customer"]);
    await env.DB.prepare("INSERT INTO notification_reads(notification_id,user_id) SELECT ?1,?2 WHERE EXISTS(SELECT 1 FROM notifications WHERE id=?1 AND active=1 AND datetime(expires_at)>CURRENT_TIMESTAMP) ON CONFLICT(notification_id,user_id) DO UPDATE SET read_at=CURRENT_TIMESTAMP").bind(params.id, user.id).run();
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}
