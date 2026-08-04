import { requireUser } from "../../_lib/auth.js";
import { handleError,json } from "../../_lib/http.js";

export async function onRequestGet({request,env}){
  try{
    await requireUser(request,env.DB,["superadmin"]);
    const [stats,families,vehicles,rewards,monthly]=await Promise.all([
      env.DB.prepare("SELECT (SELECT COUNT(*) FROM invoices WHERE strftime('%Y-%m',issued_at)=strftime('%Y-%m','now')) invoices,(SELECT COALESCE(SUM(amount_cents),0) FROM invoices WHERE strftime('%Y-%m',issued_at)=strftime('%Y-%m','now')) salesCents,(SELECT COUNT(*) FROM users WHERE role='customer' AND status='active') customers,(SELECT COUNT(*) FROM rewards WHERE active=1) rewardItems,(SELECT COUNT(*) FROM redemptions WHERE status='requested') pendingRedemptions,(SELECT COUNT(*) FROM installations i JOIN vehicles v ON v.id=i.vehicle_id WHERE i.status!='void' AND ((i.next_service_at IS NOT NULL AND datetime(i.next_service_at)<=CURRENT_TIMESTAMP) OR (i.next_service_km IS NOT NULL AND v.odometer_km>=i.next_service_km))) expiredWarranties,(SELECT COUNT(*) FROM warranty_events WHERE event_type='extended') extendedWarranties").first(),
      env.DB.prepare("SELECT f.name,COUNT(i.id) units FROM product_families f LEFT JOIN operational_products p ON p.family_id=f.id LEFT JOIN installations i ON i.product_id=p.id AND i.status!='void' GROUP BY f.id ORDER BY units DESC,f.name").all(),
      env.DB.prepare("SELECT v.brand,v.model,f.name familyName,p.name productName,COUNT(*) units FROM installations i JOIN vehicles v ON v.id=i.vehicle_id JOIN operational_products p ON p.id=i.product_id JOIN product_families f ON f.id=p.family_id WHERE i.status!='void' GROUP BY v.brand,v.model,f.id,p.id ORDER BY units DESC LIMIT 40").all(),
      env.DB.prepare("SELECT r.id,r.name,r.points_cost pointsCost,r.price_cents priceCents,r.cash_after_points_cents cashAfterPointsCents,r.stock_limit stockLimit,COUNT(rd.id) requested FROM rewards r LEFT JOIN redemptions rd ON rd.reward_id=r.id AND rd.status IN ('requested','approved','delivered') GROUP BY r.id ORDER BY requested DESC,r.name").all(),
      env.DB.prepare("SELECT CAST(strftime('%d',issued_at) AS INTEGER) day,COUNT(*) invoices,COALESCE(SUM(amount_cents),0) amountCents FROM invoices WHERE strftime('%Y-%m',issued_at)=strftime('%Y-%m','now') GROUP BY day ORDER BY day").all()
    ]);
    return json({stats,families:families.results||[],vehicleProducts:vehicles.results||[],rewards:rewards.results||[],monthly:monthly.results||[]});
  }catch(error){return handleError(error);}
}
