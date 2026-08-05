import assert from "node:assert/strict";
import test from "node:test";
import { getPeriodStart } from "../functions/api/superadmin/metrics.js";

const NOW = Date.parse("2026-08-05T03:30:00.000Z"); // 22:30 del 4 de agosto en Ecuador.

test("uses Ecuador time for daily, weekly and monthly metric periods", () => {
  assert.equal(getPeriodStart("day", NOW), "2026-08-04T05:00:00.000Z");
  assert.equal(getPeriodStart("week", NOW), "2026-08-03T05:00:00.000Z");
  assert.equal(getPeriodStart("month", NOW), "2026-08-01T05:00:00.000Z");
});
