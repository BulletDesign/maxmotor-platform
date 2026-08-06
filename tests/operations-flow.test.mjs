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

test("sale registration supports multiple coverage items and optional invoice points", async () => {
  const route = await readFile(new URL("../functions/api/admin/sales.js", import.meta.url), "utf8");
  assert.match(route, /Array\.isArray\(body\.items\)/);
  assert.match(route, /MAX_ITEMS_PER_INVOICE/);
  assert.match(route, /item\.appliesWarranty/);
  assert.match(route, /appliesWarranty \? "full" : "limited"/);
  assert.match(route, /body\.awardPoints !== false/);
  assert.match(route, /points_enabled/);
  assert.match(route, /if \(points > 0\)/);
  await assert.rejects(access(new URL("../functions/api/admin/points/adjust.js", import.meta.url)));
});
