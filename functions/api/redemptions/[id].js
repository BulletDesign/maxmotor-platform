import { requireUser } from "../../_lib/auth.js";
import { assertSameOrigin,handleError,HttpError,json,readJson } from "../../_lib/http.js";

export async function onRequestPatch({request,env,params}){
  try{
    assertSameOrigin(request);
    const actor=await requireUser(request,env.DB,["employee","superadmin"]);
    const body=await readJson(request);
    const status=String(body.status||"");
    if(!["approved","rejected","delivered","cancelled"].includes(status))throw new HttpError(400,"Estado invalido");
    const current=await env.DB.prepare("SELECT id,user_id userId,points_reserved pointsReserved,status FROM redemptions WHERE id=?1").bind(params.id).first();
    if(!current)throw new HttpError(404,"Canje no encontrado");
    const transitions={requested:["approved","rejected","cancelled"],approved:["delivered"],rejected:[],delivered:[],cancelled:[]};
    if(!transitions[current.status]?.includes(status))throw new HttpError(409,"Transicion de canje no permitida");
    const statements=[env.DB.prepare("UPDATE redemptions SET status=?1,reviewed_by=?2,updated_at=CURRENT_TIMESTAMP WHERE id=?3").bind(status,actor.id,params.id),env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'redemption.review','redemption',?3,?4)").bind(crypto.randomUUID(),actor.id,params.id,JSON.stringify({previous:current.status,status}))];
    if(status==="approved")statements.push(env.DB.prepare("INSERT INTO points_ledger(id,user_id,movement_type,points,description,created_by) VALUES(?1,?2,'redeem',?3,'Canje aprobado',?4)").bind(crypto.randomUUID(),current.userId,-current.pointsReserved,actor.id));
    await env.DB.batch(statements);
    return json({ok:true,status});
  }catch(error){return handleError(error);}
}
