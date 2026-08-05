import { requireUser } from "../../_lib/auth.js";
import { handleError, json } from "../../_lib/http.js";

const ECUADOR_OFFSET_MS = 5 * 60 * 60 * 1000;

export function getPeriodStart(period, now = Date.now()) {
  return getPeriodRange(period, now).startAt;
}

export function getPeriodRange(period, now = Date.now()) {
  const local = new Date(now - ECUADOR_OFFSET_MS);
  let year = local.getUTCFullYear();
  let month = local.getUTCMonth();
  let day = local.getUTCDate();
  if (period === "month") day = 1;
  if (period === "week") {
    const daysSinceMonday = (local.getUTCDay() + 6) % 7;
    const monday = new Date(Date.UTC(year, month, day - daysSinceMonday));
    year = monday.getUTCFullYear(); month = monday.getUTCMonth(); day = monday.getUTCDate();
  }
  const startLocal = Date.UTC(year, month, day);
  const endLocal = period === "month" ? Date.UTC(year, month + 1, 1) : startLocal + (period === "week" ? 7 : 1) * 86400000;
  return {
    startAt: new Date(startLocal + ECUADOR_OFFSET_MS).toISOString(),
    endAt: new Date(endLocal + ECUADOR_OFFSET_MS).toISOString(),
  };
}

function chartQuery(period) {
  if (period === "day") return "SELECT strftime('%H:00',datetime(issued_at,'-5 hours')) label,COUNT(*) invoices,COALESCE(SUM(amount_cents),0) amountCents FROM invoices WHERE datetime(issued_at)>=datetime(?1) AND datetime(issued_at)<datetime(?2) GROUP BY label ORDER BY label";
  return "SELECT strftime('%Y-%m-%d',datetime(issued_at,'-5 hours')) label,COUNT(*) invoices,COALESCE(SUM(amount_cents),0) amountCents FROM invoices WHERE datetime(issued_at)>=datetime(?1) AND datetime(issued_at)<datetime(?2) GROUP BY label ORDER BY label";
}

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["superadmin"]);
    const requestedPeriod = new URL(request.url).searchParams.get("period") || "month";
    const period = ["day", "week", "month"].includes(requestedPeriod) ? requestedPeriod : "month";
    const { startAt, endAt } = getPeriodRange(period);

    const [stats, families, vehicleProducts, rewards, chart, topProducts, topVehicles, provinces, ages, invoices] = await Promise.all([
      env.DB.prepare("SELECT (SELECT COUNT(*) FROM invoices WHERE datetime(issued_at)>=datetime(?1) AND datetime(issued_at)<datetime(?2)) invoices,(SELECT COALESCE(SUM(amount_cents),0) FROM invoices WHERE datetime(issued_at)>=datetime(?1) AND datetime(issued_at)<datetime(?2)) salesCents,(SELECT COUNT(*) FROM users WHERE role='customer' AND status='active') customers,(SELECT COUNT(*) FROM rewards WHERE active=1) rewardItems,(SELECT COUNT(*) FROM redemptions WHERE status IN ('requested','pending_delivery')) pendingRedemptions,(SELECT COUNT(*) FROM installations i JOIN vehicles v ON v.id=i.vehicle_id WHERE i.status!='void' AND ((i.next_service_at IS NOT NULL AND datetime(i.next_service_at)<=CURRENT_TIMESTAMP) OR (i.next_service_km IS NOT NULL AND v.odometer_km>=i.next_service_km))) expiredWarranties,(SELECT COUNT(*) FROM warranty_events WHERE event_type='extended' AND datetime(created_at)>=datetime(?1) AND datetime(created_at)<datetime(?2)) extendedWarranties").bind(startAt,endAt).first(),
      env.DB.prepare("SELECT f.name,COUNT(i.id) units FROM product_families f LEFT JOIN operational_products p ON p.family_id=f.id LEFT JOIN installations i ON i.product_id=p.id AND i.status!='void' AND datetime(i.installed_at)>=datetime(?1) AND datetime(i.installed_at)<datetime(?2) GROUP BY f.id ORDER BY units DESC,f.name").bind(startAt,endAt).all(),
      env.DB.prepare("SELECT v.brand,v.model,f.name familyName,p.name productName,COUNT(*) units FROM installations i JOIN vehicles v ON v.id=i.vehicle_id JOIN operational_products p ON p.id=i.product_id JOIN product_families f ON f.id=p.family_id WHERE i.status!='void' AND datetime(i.installed_at)>=datetime(?1) AND datetime(i.installed_at)<datetime(?2) GROUP BY v.brand,v.model,f.id,p.id ORDER BY units DESC LIMIT 40").bind(startAt,endAt).all(),
      env.DB.prepare("SELECT r.id,r.name,r.points_cost pointsCost,r.price_cents priceCents,r.cash_after_points_cents cashAfterPointsCents,r.stock_limit stockLimit,COUNT(rd.id) requested FROM rewards r LEFT JOIN redemptions rd ON rd.reward_id=r.id AND rd.status IN ('requested','pending_delivery','claimed') GROUP BY r.id ORDER BY requested DESC,r.name").all(),
      env.DB.prepare(chartQuery(period)).bind(startAt,endAt).all(),
      env.DB.prepare("SELECT p.name,f.name familyName,COUNT(*) units FROM installations i JOIN operational_products p ON p.id=i.product_id JOIN product_families f ON f.id=p.family_id WHERE i.status!='void' AND datetime(i.installed_at)>=datetime(?1) AND datetime(i.installed_at)<datetime(?2) GROUP BY p.id ORDER BY units DESC,p.name LIMIT 5").bind(startAt,endAt).all(),
      env.DB.prepare("SELECT v.brand,v.model,COUNT(*) units FROM installations i JOIN vehicles v ON v.id=i.vehicle_id WHERE i.status!='void' AND datetime(i.installed_at)>=datetime(?1) AND datetime(i.installed_at)<datetime(?2) GROUP BY v.brand,v.model ORDER BY units DESC,v.brand,v.model LIMIT 5").bind(startAt,endAt).all(),
      env.DB.prepare("SELECT origin_province province,COUNT(*) users FROM users WHERE role='customer' AND status='active' AND origin_province IS NOT NULL AND datetime(created_at)>=datetime(?1) AND datetime(created_at)<datetime(?2) GROUP BY origin_province ORDER BY users DESC,origin_province").bind(startAt,endAt).all(),
      env.DB.prepare("SELECT CASE WHEN age BETWEEN 18 AND 24 THEN '18-24' WHEN age BETWEEN 25 AND 34 THEN '25-34' WHEN age BETWEEN 35 AND 44 THEN '35-44' WHEN age BETWEEN 45 AND 54 THEN '45-54' WHEN age>=55 THEN '55+' ELSE 'Sin dato' END ageRange,COUNT(*) users FROM (SELECT CAST((julianday('now')-julianday(birth_date))/365.2425 AS INTEGER) age FROM users WHERE role='customer' AND status='active' AND birth_date IS NOT NULL AND datetime(created_at)>=datetime(?1) AND datetime(created_at)<datetime(?2)) GROUP BY ageRange ORDER BY CASE ageRange WHEN '18-24' THEN 1 WHEN '25-34' THEN 2 WHEN '35-44' THEN 3 WHEN '45-54' THEN 4 WHEN '55+' THEN 5 ELSE 6 END").bind(startAt,endAt).all(),
      env.DB.prepare("SELECT i.invoice_number invoiceNumber,i.amount_cents amountCents,i.issued_at issuedAt,u.full_name customerName,u.customer_code customerCode FROM invoices i JOIN users u ON u.id=i.user_id WHERE datetime(i.issued_at)>=datetime(?1) AND datetime(i.issued_at)<datetime(?2) ORDER BY datetime(i.issued_at) DESC,i.created_at DESC LIMIT 100").bind(startAt,endAt).all(),
    ]);

    return json({
      period,
      startAt,
      endAt,
      stats,
      families: families.results || [],
      vehicleProducts: vehicleProducts.results || [],
      rewards: rewards.results || [],
      chart: chart.results || [],
      topProducts: topProducts.results || [],
      topVehicles: topVehicles.results || [],
      provinces: provinces.results || [],
      ages: ages.results || [],
      invoices: invoices.results || [],
    });
  } catch (error) {
    return handleError(error);
  }
}
