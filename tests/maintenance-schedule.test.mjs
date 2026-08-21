import assert from "node:assert/strict";
import test from "node:test";
import {
  initialMaintenanceSchedule,
  recurringMaintenanceInterval,
} from "../functions/_lib/maintenance-schedule.js";

test("a new suspension schedules its mandatory adjustment at 2000 km or 20 days", () => {
  const schedule = initialMaintenanceSchedule({
    product: { name: "Tough Dog", familyName: "Suspensiones", serviceDays: 60, serviceKm: 10000 },
    trackingMode: "both",
    installedAt: "2026-08-21T12:00:00.000Z",
    installedKm: 45000,
  });
  assert.equal(schedule.scheduleType, "suspension-initial");
  assert.equal(schedule.nextServiceKm, 47000);
  assert.equal(schedule.nextServiceAt, "2026-09-10T12:00:00.000Z");
});

test("subsequent suspension services use the regular 10000 km cycle", () => {
  const interval = recurringMaintenanceInterval(
    { name: "Kit suspension", familyName: "Suspension", serviceDays: 60, serviceKm: 5000 },
    "both",
  );
  assert.deepEqual(interval, { serviceDays: 60, serviceKm: 10000 });
});

test("other products preserve their catalog maintenance intervals", () => {
  const schedule = initialMaintenanceSchedule({
    product: { name: "Barra de tiro", familyName: "Barras", serviceDays: 90, serviceKm: 7500 },
    trackingMode: "both",
    installedAt: "2026-08-21T12:00:00.000Z",
    installedKm: 12000,
  });
  assert.equal(schedule.scheduleType, "standard");
  assert.equal(schedule.nextServiceKm, 19500);
  assert.equal(schedule.nextServiceAt, "2026-11-19T12:00:00.000Z");
});
