import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";
import { getInvoiceHistory } from "../../_lib/invoice-history.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireUser(request, env.DB, ["customer"]);
    const [balance, movements, invoiceSummary, invoices] = await Promise.all([
      env.DB.prepare("SELECT COALESCE(SUM(points),0)-(SELECT COALESCE(SUM(points_reserved),0) FROM redemptions WHERE user_id=?1 AND status='requested') balance FROM points_ledger WHERE user_id=?1").bind(user.id).first(),
      env.DB.prepare(`SELECT pl.movement_type,pl.points,pl.description,pl.created_at,
        i.invoice_number invoiceNumber FROM points_ledger pl
        LEFT JOIN invoices i ON i.id=pl.invoice_id
        WHERE pl.user_id=?1 ORDER BY datetime(pl.created_at) DESC LIMIT 50`).bind(user.id).all(),
      env.DB.prepare("SELECT (SELECT COUNT(*) FROM invoices WHERE user_id=?1) total,(SELECT COALESCE(SUM(amount_cents),0) FROM invoices WHERE user_id=?1)+(SELECT COALESCE(SUM(cash_after_points_cents),0) FROM redemptions WHERE user_id=?1 AND status='claimed') amountCents").bind(user.id).first(),
      getInvoiceHistory(env.DB, user.id),
    ]);
    return json({
      balance: balance.balance,
      movements: movements.results || [],
      invoiceCount: invoiceSummary.total,
      invoiceAmountCents: invoiceSummary.amountCents,
      invoices,
    });
  } catch (error) { return handleError(error); }
}
