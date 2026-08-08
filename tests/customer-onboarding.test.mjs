import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { generateTemporaryPassword, normalizeWhatsappPhone } from "../functions/_lib/customer-identity.js";
import { HttpError } from "../functions/_lib/http.js";

async function source(relativePath) {
  return readFile(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

test("normalizes Ecuador WhatsApp numbers and rejects invalid phones", () => {
  assert.equal(normalizeWhatsappPhone("098 798 6672"), "593987986672");
  assert.equal(normalizeWhatsappPhone("+593 987 986 672"), "593987986672");
  assert.throws(
    () => normalizeWhatsappPhone("12345"),
    (error) => error instanceof HttpError && error.status === 400,
  );
});

test("generates readable temporary passwords without ambiguous characters", () => {
  const passwords = new Set(Array.from({ length: 25 }, () => generateTemporaryPassword()));
  assert.equal(passwords.size, 25);
  for (const password of passwords) assert.match(password, /^MXR-[A-HJ-NP-Z]{4}-[2-9]{4}$/);
});

test("staff onboarding is protected and stores only password hashes", async () => {
  const route = await source("../functions/api/admin/customers.js");
  assert.match(route, /assertSameOrigin\(request\)/);
  assert.match(route, /requireUser\(request, env\.DB, \["employee", "superadmin"\]\)/);
  assert.match(route, /hashPassword\(temporaryPassword\)/);
  assert.match(route, /secured\.hash, secured\.salt/);
  assert.match(route, /birth_date,origin_province[\s\S]*NULL,NULL,\?8/);
  assert.match(route, /'whatsapp_service'/);
  assert.match(route, /'marketing'/);
  assert.match(route, /customer\.staff_create/);
  assert.match(route, /https:\/\/wa\.me\/\$\{whatsappPhone\}/);
  assert.doesNotMatch(route, /JSON\.stringify\(\{[^}]*temporaryPassword/);
});

test("the employee portal separates assisted signup from multi-accessory sales", async () => {
  const [html, script] = await Promise.all([
    source("../portal-admin.html"),
    source("../assets/portal-admin.js"),
  ]);
  assert.match(html, /Ingreso de clientes/);
  assert.match(html, /id="customer-onboarding-form"/);
  assert.doesNotMatch(html, /id="customer-onboarding-form"[\s\S]*?name="birthDate"[\s\S]*?<\/form>/);
  assert.doesNotMatch(html, /id="customer-onboarding-form"[\s\S]*?name="password"[\s\S]*?<\/form>/);
  assert.match(script, /await openCustomerFile\(onboardedCustomerId\)/);
  assert.match(script, /#customer-invoice-form/);
  assert.match(script, /#onboarding-password/);
});

test("dismissed promotion and completed tours persist across browser sessions", async () => {
  const [indexScript, tourScript] = await Promise.all([
    source("../assets/index-app.js"),
    source("../assets/guided-tour.js"),
  ]);
  assert.match(indexScript, /localStorage/);
  assert.match(indexScript, /mxr_offer_dismissed_v1/);
  assert.doesNotMatch(indexScript, /mxr_offer_seen_session/);
  assert.match(tourScript, /localStorage/);
  assert.match(tourScript, /maxmotor-tour-\$\{id\}-v1/);
  assert.match(tourScript, /completed/);
});
