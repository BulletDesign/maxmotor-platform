import { normalizeWhatsappPhone } from "./customer-identity.js";

export const REMINDER_COOLDOWN_DAYS = 15;
export const MAX_REMINDERS_PER_OPPORTUNITY = 2;

export function firstName(fullName) {
  return String(fullName || "Cliente").trim().split(/\s+/)[0] || "Cliente";
}

export function rewardSignature(rewards) {
  const highestCost = Math.max(...rewards.map((reward) => Number(reward.pointsCost)), 0);
  const tierIds = rewards.filter((reward) => Number(reward.pointsCost) === highestCost).map((reward) => reward.id).sort();
  return `${highestCost}:${tierIds.join(",")}`;
}

export function rewardReminderMessage(customer, rewards) {
  const items = rewards.slice(0, 2).map((reward) => `• ${reward.name} — ${Number(reward.pointsCost).toLocaleString("es-EC")} TP`).join("\n");
  return `Hola ${firstName(customer.fullName)}, te recordamos que tienes ${Number(customer.points).toLocaleString("es-EC")} Traction Points disponibles.\n\nYa puedes canjearlos por equipamiento para tu 4x4:\n${items}\n\nPara canjearlos, ingresa a tu cuenta en https://maxmotor4x4.com/MiMaxmotor, abre Traction Points y elige tu recompensa.\n\nSi prefieres no recibir estos recordatorios, responde NO.\n\nTOOLS NOT TOYS`;
}

export function whatsappUrl(phone, message) {
  return `https://wa.me/${normalizeWhatsappPhone(phone)}?text=${encodeURIComponent(message)}`;
}
