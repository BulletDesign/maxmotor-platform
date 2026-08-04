import { requireUser } from "../../../_lib/auth.js";
import { assertSameOrigin,handleError,HttpError,json,readJson } from "../../../_lib/http.js";

export async function onRequestPatch({request,env,params}){
  try{
    assertSameOrigin(request);
    const actor=await requireUser(request,env.DB,["employee","superadmin"]);
    const body=await readJson(request);
    const current=await env.DB.prepare("SELECT id,next_service_at nextServiceAt,next_service_km nextServiceKm,status FROM installations WHERE id=?1").bind(params.id).first();
    if(!current)throw new HttpError(404,"Instalacion no encontrada");
    const addDays=Math.max(0,Number(body.additionalDays)||0);
    const addKm=Math.max(0,Number(body.additionalKm)||0);
    if(!addDays&&!addKm)throw new HttpError(400,"Indica dias o kilometros para extender");
    const baseDate=current.nextServiceAt?new Date(current.nextServiceAt):new Date();
    const nextDate=addDays?new Date(baseDate.getTime()+addDays*86400000).toISOString():current.nextServiceAt;
    const nextKm=addKm?Number(current.nextServiceKm||0)+addKm:current.nextServiceKm;
    await env.DB.batch([
      env.DB.prepare("UPDATE installations SET next_service_at=?1,next_service_km=?2,status='active' WHERE id=?3").bind(nextDate,nextKm,params.id),
      env.DB.prepare("UPDATE warranties SET service_due_at=?1,service_due_km=?2,status='active' WHERE id=(SELECT warranty_id FROM installations WHERE id=?3)").bind(nextDate,nextKm,params.id),
      env.DB.prepare("INSERT INTO warranty_events(id,installation_id,event_type,previous_due_at,new_due_at,previous_due_km,new_due_km,notes,created_by) VALUES(?1,?2,'extended',?3,?4,?5,?6,?7,?8)").bind(crypto.randomUUID(),params.id,current.nextServiceAt,nextDate,current.nextServiceKm,nextKm,String(body.notes||"").trim(),actor.id),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'warranty.extend','installation',?3,?4)").bind(crypto.randomUUID(),actor.id,params.id,JSON.stringify({addDays,addKm,nextDate,nextKm}))
    ]);
    return json({nextServiceAt:nextDate,nextServiceKm:nextKm});
  }catch(error){return handleError(error);}
}
