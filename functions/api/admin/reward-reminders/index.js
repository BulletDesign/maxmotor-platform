import { requireUser } from "../../../_lib/auth.js";
import { HttpError, assertSameOrigin, handleError, json, readJson } from "../../../_lib/http.js";
import { MAX_REMINDERS_PER_OPPORTUNITY, REMINDER_COOLDOWN_DAYS, rewardReminderMessage, rewardSignature, whatsappUrl } from "../../../_lib/reward-reminders.js";

const ACTIONS = new Set(["sent", "not_sent", "skipped", "postponed", "opted_out", "invalid_phone"]);

function addDays(dateValue, days) {
  return new Date(new Date(dateValue).getTime() + days * 86400000);
}

async function reminderData(db) {
  const [customersData, rewardsData, preferencesData, sentData, recentData] = await Promise.all([
    db.prepare(`SELECT u.id,u.customer_code customerCode,u.full_name fullName,u.phone,
      COALESCE((SELECT SUM(p.points) FROM points_ledger p WHERE p.user_id=u.id),0)
      - COALESCE((SELECT SUM(rd.points_reserved) FROM redemptions rd WHERE rd.user_id=u.id AND rd.status='requested'),0) points,
      EXISTS(SELECT 1 FROM consents c WHERE c.user_id=u.id AND c.consent_type='whatsapp_service') whatsappConsent,
      EXISTS(SELECT 1 FROM consents c WHERE c.user_id=u.id AND c.consent_type='marketing') marketingConsent
      FROM users u WHERE u.role='customer' AND u.status='active' ORDER BY u.full_name`).all(),
    db.prepare(`SELECT r.id,r.name,r.points_cost pointsCost,r.stock_limit stockLimit,
      COUNT(rd.id) reserved FROM rewards r
      LEFT JOIN redemptions rd ON rd.reward_id=r.id AND rd.status IN ('requested','pending_delivery','claimed')
      WHERE r.active=1 GROUP BY r.id HAVING r.stock_limit=0 OR reserved<r.stock_limit ORDER BY r.points_cost DESC,r.name`).all(),
    db.prepare("SELECT user_id userId,contact_status contactStatus,paused_until pausedUntil FROM reward_reminder_preferences").all(),
    db.prepare("SELECT user_id userId,reward_signature rewardSignature,created_at createdAt FROM reward_reminder_events WHERE action='sent' ORDER BY created_at DESC").all(),
    db.prepare(`SELECT e.id,e.action,e.points_snapshot pointsSnapshot,e.created_at createdAt,
      u.full_name fullName,u.customer_code customerCode,a.full_name actorName
      FROM reward_reminder_events e JOIN users u ON u.id=e.user_id
      LEFT JOIN users a ON a.id=e.actor_user_id ORDER BY e.created_at DESC LIMIT 30`).all(),
  ]);

  const customers = customersData.results || [];
  const rewards = rewardsData.results || [];
  const preferences = new Map((preferencesData.results || []).map((item) => [item.userId, item]));
  const sentByCustomer = new Map();
  for (const event of sentData.results || []) {
    const entries = sentByCustomer.get(event.userId) || [];
    entries.push(event);
    sentByCustomer.set(event.userId, entries);
  }

  const pendingData = await db.prepare("SELECT user_id userId,reward_id rewardId FROM redemptions WHERE status IN ('requested','pending_delivery')").all();
  const pendingByCustomer = new Map();
  for (const item of pendingData.results || []) {
    const ids = pendingByCustomer.get(item.userId) || new Set();
    ids.add(item.rewardId);
    pendingByCustomer.set(item.userId, ids);
  }

  const now = new Date();
  const summary = { customers: customers.length, eligible: 0, cooldown: 0, paused: 0, optedOut: 0, invalidPhone: 0, noConsent: 0, noReward: 0, limitReached: 0 };
  const queue = [];
  for (const customer of customers) {
    const preference = preferences.get(customer.id);
    if (preference?.contactStatus === "opted_out") { summary.optedOut += 1; continue; }
    if (preference?.contactStatus === "invalid_phone") { summary.invalidPhone += 1; continue; }
    if (!Number(customer.whatsappConsent) || !Number(customer.marketingConsent)) { summary.noConsent += 1; continue; }
    if (preference?.pausedUntil && new Date(preference.pausedUntil) > now) { summary.paused += 1; continue; }
    const pending = pendingByCustomer.get(customer.id) || new Set();
    const affordable = rewards.filter((reward) => Number(reward.pointsCost) <= Number(customer.points) && !pending.has(reward.id));
    if (!affordable.length) { summary.noReward += 1; continue; }
    const signature = rewardSignature(affordable);
    const sent = (sentByCustomer.get(customer.id) || []).filter((event) => event.rewardSignature === signature);
    if (sent.length >= MAX_REMINDERS_PER_OPPORTUNITY) { summary.limitReached += 1; continue; }
    const latestSent = (sentByCustomer.get(customer.id) || [])[0];
    if (latestSent && addDays(latestSent.createdAt, REMINDER_COOLDOWN_DAYS) > now) { summary.cooldown += 1; continue; }
    const featuredRewards = affordable.slice(0, 2);
    const message = rewardReminderMessage(customer, featuredRewards);
    let url;
    try { url = whatsappUrl(customer.phone, message); } catch { summary.invalidPhone += 1; continue; }
    queue.push({ ...customer, points: Number(customer.points), rewards: featuredRewards, rewardSignature: signature, reminderNumber: sent.length + 1, message, whatsappUrl: url });
  }
  summary.eligible = queue.length;
  return { queue, summary, recent: recentData.results || [] };
}

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env.DB, ["employee", "superadmin"]);
    const data = await reminderData(env.DB);
    const localDate = new Intl.DateTimeFormat("es-EC", { timeZone: "America/Guayaquil", weekday: "long", day: "numeric", month: "long" }).format(new Date());
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/Guayaquil", weekday: "short" }).format(new Date());
    return json({ ...data, schedule: { localDate, recommendedDay: ["Tue", "Fri"].includes(weekday), cooldownDays: REMINDER_COOLDOWN_DAYS, maximumPerOpportunity: MAX_REMINDERS_PER_OPPORTUNITY } });
  } catch (error) { return handleError(error); }
}

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    const action = String(body.action || "");
    const customerId = String(body.customerId || "");
    if (!ACTIONS.has(action) || !customerId) throw new HttpError(400, "Accion de recordatorio invalida");
    const current = (await reminderData(env.DB)).queue.find((item) => item.id === customerId);
    if (!current) throw new HttpError(409, "Este cliente ya no esta disponible en la cola. Actualiza la jornada");

    const statements = [];
    let contactStatus = "active";
    let pausedUntil = null;
    if (["not_sent", "skipped"].includes(action)) pausedUntil = addDays(new Date(), 1).toISOString();
    if (action === "postponed") pausedUntil = addDays(new Date(), 30).toISOString();
    if (action === "opted_out") contactStatus = "opted_out";
    if (action === "invalid_phone") contactStatus = "invalid_phone";
    if (action !== "sent") {
      statements.push(env.DB.prepare(`INSERT INTO reward_reminder_preferences(user_id,contact_status,paused_until,updated_by,updated_at)
        VALUES(?1,?2,?3,?4,CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET contact_status=excluded.contact_status,paused_until=excluded.paused_until,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).bind(customerId, contactStatus, pausedUntil, actor.id));
    }
    statements.push(
      env.DB.prepare("INSERT INTO reward_reminder_events(id,user_id,actor_user_id,action,points_snapshot,reward_signature,rewards_json,message_text) VALUES(?1,?2,?3,?4,?5,?6,?7,?8)")
        .bind(crypto.randomUUID(), customerId, actor.id, action, current.points, current.rewardSignature, JSON.stringify(current.rewards), action === "sent" ? current.message : null),
      env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,entity_type,entity_id,metadata_json) VALUES(?1,?2,'reward_reminder.action','user',?3,?4)")
        .bind(crypto.randomUUID(), actor.id, customerId, JSON.stringify({ action, points: current.points, rewardSignature: current.rewardSignature })),
    );
    await env.DB.batch(statements);
    return json({ ok: true, action });
  } catch (error) { return handleError(error); }
}
