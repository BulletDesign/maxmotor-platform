import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("claimed reward cash counts as customer spend without creating TP", async () => {
  const summary = await readFile(new URL("../functions/api/points/summary.js", import.meta.url), "utf8");
  const redemption = await readFile(new URL("../functions/api/redemptions/[id].js", import.meta.url), "utf8");
  assert.match(summary, /SUM\(cash_after_points_cents\).*status='claimed'/);
  assert.doesNotMatch(redemption, /movement_type[^\n]*earn/);
});
