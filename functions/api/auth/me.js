import { currentUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";
export async function onRequestGet({ request, env }) { try { const role=new URL(request.url).searchParams.get("role"); const user=await currentUser(request,env.DB,role?[role]:[]); return json({ user }); } catch(error){ return handleError(error); } }
