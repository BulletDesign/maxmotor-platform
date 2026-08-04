import { deleteSession } from "../../_lib/auth.js";
import { assertSameOrigin, handleError, json } from "../../_lib/http.js";
export async function onRequestPost({ request, env }) { try { assertSameOrigin(request); const role=new URL(request.url).searchParams.get("role")||"customer"; return json({ ok:true }, 200, { "set-cookie":await deleteSession(request,env.DB,role) }); } catch(error){ return handleError(error); } }
