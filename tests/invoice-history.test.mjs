import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("customer and employee portals expose auditable invoice detail", async () => {
  const [helper, customerRoute, employeeRoute, customerHtml, employeeHtml] = await Promise.all([
    source("../functions/_lib/invoice-history.js"),
    source("../functions/api/points/summary.js"),
    source("../functions/api/admin/customers/[id].js"),
    source("../portal.html"),
    source("../portal-admin.html"),
  ]);

  assert.match(helper, /invoice_number invoiceNumber/);
  assert.match(helper, /points_enabled pointsEnabled/);
  assert.match(helper, /pointsEarned/);
  assert.match(helper, /productName/);
  assert.match(helper, /createdByName/);
  assert.match(customerRoute, /getInvoiceHistory/);
  assert.match(employeeRoute, /getInvoiceHistory/);
  assert.match(customerHtml, /id="invoice-history"/);
  assert.match(employeeHtml, /id="file-invoices"/);
});

test("point movements expose their linked invoice number", async () => {
  const [route, script] = await Promise.all([
    source("../functions/api/points/summary.js"),
    source("../assets/portal.js"),
  ]);

  assert.match(route, /invoice_number invoiceNumber/);
  assert.match(script, /Factura #\$\{escapeHtml\(item\.invoiceNumber\)\}/);
});
