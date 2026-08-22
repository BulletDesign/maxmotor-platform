import assert from "node:assert/strict";
import test from "node:test";
import { rewardReminderMessage, rewardSignature, whatsappUrl } from "../functions/_lib/reward-reminders.js";

const rewards = [
  { id: "winch", name: "Winch 4x4", pointsCost: 1200 },
  { id: "lights", name: "Luces LED", pointsCost: 700 },
];

test("builds a stable opportunity signature from the highest unlocked tier", () => {
  assert.equal(rewardSignature(rewards), "1200:winch");
  assert.equal(rewardSignature([...rewards].reverse()), "1200:winch");
});

test("builds a personalized reward message with opt-out language", () => {
  const message = rewardReminderMessage({ fullName: "Ana Torres", points: 1530 }, rewards);
  assert.match(message, /Hola Ana/);
  assert.match(message, /1\.530 Traction Points/);
  assert.match(message, /Winch 4x4/);
  assert.match(message, /responde NO/);
  assert.match(message, /maxmotor4x4\.com\/MiMaxmotor/);
});

test("creates a prefilled WhatsApp link for Ecuador numbers", () => {
  const url = whatsappUrl("098 765 4321", "Hola Ana");
  assert.equal(url, "https://wa.me/593987654321?text=Hola%20Ana");
});
