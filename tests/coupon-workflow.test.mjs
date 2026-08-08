import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("coupon requests use an auditable advisor workflow", async () => {
  const customerRoute = await readFile(fileURLToPath(new URL("../functions/api/coupons/index.js", import.meta.url)), "utf8");
  const advisorRoute = await readFile(fileURLToPath(new URL("../functions/api/coupons/[id].js", import.meta.url)), "utf8");
  assert.match(customerRoute, /coupon\.request/);
  assert.match(customerRoute, /status='requested'/);
  assert.match(advisorRoute, /available: \["accepted", "rejected"\]/);
  assert.match(advisorRoute, /accepted: \["redeemed", "rejected"\]/);
  assert.match(advisorRoute, /coupon\.review/);
});

test("new registrations omit national ID, VIN and odometer", async () => {
  const route = await readFile(fileURLToPath(new URL("../functions/api/auth/register.js", import.meta.url)), "utf8");
  const identity = await readFile(fileURLToPath(new URL("../functions/_lib/customer-identity.js", import.meta.url)), "utf8");
  assert.doesNotMatch(route, /body\.nationalId/);
  assert.match(route, /national_id,birth_date[\s\S]*NULL,\?8/);
  assert.match(route, /plate,vin,odometer_km[\s\S]*\?6,NULL,NULL/);
  assert.match(route, /createFriendlyCustomerCode\(env\.DB\)/);
  assert.match(identity, /MM-\$\{digits\}/);
});
