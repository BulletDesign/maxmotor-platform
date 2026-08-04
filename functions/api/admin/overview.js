import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["employee", "superadmin"]);
    const [customers, vehicles, warranties, invoices, newCustomers, redemptions, salesChart, recent] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) total FROM users WHERE role='customer' AND status='active'").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM vehicles").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM warranties WHERE status='active'").first(),
      env.DB.prepare("SELECT COUNT(*) total,COALESCE(SUM(amount_cents),0) amountCents FROM invoices WHERE strftime('%Y-%m',issued_at)=strftime('%Y-%m','now')").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM users WHERE role='customer' AND strftime('%Y-%m',created_at)=strftime('%Y-%m','now')").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM redemptions WHERE status='requested'").first(),
      env.DB.prepare("SELECT CAST(strftime('%d',issued_at) AS INTEGER) day,COUNT(*) invoices,COALESCE(SUM(amount_cents),0) amountCents FROM invoices WHERE strftime('%Y-%m',issued_at)=strftime('%Y-%m','now') GROUP BY day ORDER BY day").all(),
      env.DB.prepare("SELECT action,entity_type AS entityType,created_at AS createdAt FROM audit_log ORDER BY created_at DESC LIMIT 8").all()
    ]);
    return json({ stats:{customers:customers.total,vehicles:vehicles.total,warranties:warranties.total,invoices:invoices.total,newCustomers:newCustomers.total,redemptions:redemptions.total},month:{amountCents:invoices.amountCents,chart:salesChart.results||[]},recent:recent.results||[] });
  } catch (error) { return handleError(error); }
}
