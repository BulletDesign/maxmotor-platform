import { currentUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";
export async function onRequestGet({ request, env }) { try { const user=await currentUser(request,env.DB); return json({ user }); } catch(error){ return handleError(error); } }
