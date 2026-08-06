import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assertSameOrigin, HttpError } from "../functions/_lib/http.js";

test("accepts only an explicit same-origin mutation", () => {
  const valid = new Request("https://maxmotor4x4.com/api/account", { method: "PATCH", headers: { origin: "https://maxmotor4x4.com" } });
  assert.doesNotThrow(() => assertSameOrigin(valid));

  for (const origin of [null, "https://attacker.example"]) {
    const headers = origin ? { origin } : {};
    const request = new Request("https://maxmotor4x4.com/api/account", { method: "PATCH", headers });
    assert.throws(() => assertSameOrigin(request), (error) => error instanceof HttpError && error.status === 403);
  }
});

test("every mutating API route enforces same-origin requests", async () => {
  const root = fileURLToPath(new URL("../functions/api/", import.meta.url));
  async function files(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
  }
  for (const file of await files(root)) {
    if (!file.endsWith(".js")) continue;
    const source = await readFile(file, "utf8");
    if (/onRequest(?:Post|Patch|Delete)/.test(source)) assert.match(source, /assertSameOrigin\(request\)/, file);
  }
});

test("the employee sale route persists every linked commercial record", async () => {
  const source = await readFile(fileURLToPath(new URL("../functions/api/admin/sales.js", import.meta.url)), "utf8");
  for (const table of ["invoices", "points_ledger", "warranties", "installations", "audit_log"]) {
    assert.match(source, new RegExp(`INSERT INTO ${table}\\b`), `sales.js must persist ${table}`);
  }
  assert.match(source, /requireUser\(request, env\.DB, \["employee", "superadmin"\]\)/);
  assert.match(source, /await env\.DB\.batch\(statements\)/);
  assert.match(source, /sale\.install\.multi/);
});
