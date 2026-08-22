import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("invoice corrections are restricted, recalculated and audited", async () => {
  const route = await source("../functions/api/superadmin/invoices/[id].js");
  assert.match(route, /requireUser\(request, env\.DB, \["superadmin"\]\)/);
  assert.match(route, /assertSameOrigin/);
  assert.match(route, /pointsForPurchase/);
  assert.match(route, /pointsDelta/);
  assert.match(route, /invoice\.correct/);
});

test("a superadmin can attach a corrected installation to an existing invoice", async () => {
  const [route, adminScript, consoleHtml] = await Promise.all([
    source("../functions/api/superadmin/invoices/[id]/installations.js"),
    source("../assets/portal-admin.js"),
    source("../portal-superadmin.html"),
  ]);
  assert.match(route, /requireUser\(request, env\.DB, \["superadmin"\]\)/);
  assert.match(route, /initialMaintenanceSchedule/);
  assert.match(route, /recurringMaintenanceInterval/);
  assert.match(route, /invoice\.installation_correct/);
  assert.match(adminScript, /data-correct-invoice/);
  assert.match(adminScript, /data-add-invoice-installation/);
  assert.match(consoleHtml, /Clientes y correcciones/);
});
