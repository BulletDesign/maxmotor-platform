import assert from "node:assert/strict";
import test from "node:test";
import { getPeriodRange, getPeriodStart } from "../functions/api/superadmin/metrics.js";

const NOW = Date.parse("2026-08-05T03:30:00.000Z"); // 22:30 del 4 de agosto en Ecuador.

test("uses Ecuador time for daily, weekly and monthly metric periods", () => {
  assert.equal(getPeriodStart("day", NOW), "2026-08-04T05:00:00.000Z");
  assert.equal(getPeriodStart("week", NOW), "2026-08-03T05:00:00.000Z");
  assert.equal(getPeriodStart("month", NOW), "2026-08-01T05:00:00.000Z");
});

test("closes every metric period so future invoices cannot leak into totals", () => {
  assert.deepEqual(getPeriodRange("day", NOW), { startAt: "2026-08-04T05:00:00.000Z", endAt: "2026-08-05T05:00:00.000Z" });
  assert.deepEqual(getPeriodRange("week", NOW), { startAt: "2026-08-03T05:00:00.000Z", endAt: "2026-08-10T05:00:00.000Z" });
  assert.deepEqual(getPeriodRange("month", NOW), { startAt: "2026-08-01T05:00:00.000Z", endAt: "2026-09-01T05:00:00.000Z" });
});
