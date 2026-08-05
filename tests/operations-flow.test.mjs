import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("uses the auditable redemption delivery workflow", async () => {
  const migration = await readFile(new URL("../migrations/0013_redemption_fulfillment_and_coverage.sql", import.meta.url), "utf8");
  const route = await readFile(new URL("../functions/api/redemptions/[id].js", import.meta.url), "utf8");
  assert.match(migration, /reward_name TEXT NOT NULL/);
  assert.match(migration, /ON DELETE SET NULL/);
  assert.match(route, /pending_delivery/);
  assert.match(route, /status === "claimed" && current\.fulfillmentType === "install"/);
  assert.match(route, /'refund'/);
});

test("sale registration supports full and limited coverage without manual TP", async () => {
  const route = await readFile(new URL("../functions/api/admin/sales.js", import.meta.url), "utf8");
  assert.match(route, /body\.appliesWarranty === true/);
  assert.match(route, /appliesWarranty \? "full" : "limited"/);
  assert.match(route, /if \(points > 0\)/);
  await assert.rejects(access(new URL("../functions/api/admin/points/adjust.js", import.meta.url)));
});
