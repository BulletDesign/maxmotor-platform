import { deleteSession } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, json } from "../../_lib/http.js";
export async function onRequestPost({ request, env }) { try { assertSameOrigin(request); return json({ ok:true }, 200, { "set-cookie":await deleteSession(request,env.DB) }); } catch(error){ return handleError(error); } }
