import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Traction Point adjustments are superadmin-only, additive and audited", async () => {
  const route = await source("../functions/api/superadmin/points.js");
  assert.match(route, /requireUser\(request, env\.DB, \["superadmin"\]\)/);
  assert.match(route, /assertSameOrigin\(request\)/);
  assert.match(route, /INSERT INTO points_ledger/);
  assert.match(route, /'adjust'/);
  assert.match(route, /points\.adjust/);
  assert.match(route, /points > availableBefore/);
  assert.doesNotMatch(route, /UPDATE points_ledger/);
  assert.doesNotMatch(route, /DELETE FROM points_ledger/);
});

test("Console exposes customer TP controls and full product editing", async () => {
  const [html, script] = await Promise.all([
    source("../portal-superadmin.html"),
    source("../assets/portal-superadmin.js"),
  ]);
  assert.match(html, /data-view="points"/);
  assert.match(html, /id="points-adjust-form"/);
  assert.match(script, /\/api\/superadmin\/points/);
  assert.match(script, /data-edit-product/);
  assert.match(script, /method: editing \? "PATCH" : "POST"/);
});
