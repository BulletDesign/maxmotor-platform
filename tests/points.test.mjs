import assert from "node:assert/strict";
import test from "node:test";
import { pointsForPurchase } from "../functions/_lib/points.js";

test("awards one point for every thirty dollars", () => {
  assert.equal(pointsForPurchase(2999), 0);
  assert.equal(pointsForPurchase(3000), 1);
  assert.equal(pointsForPurchase(32999), 10);
  assert.equal(pointsForPurchase(33000), 11);
});

test("rejects invalid purchase amounts", () => {
  assert.equal(pointsForPurchase(-3000), 0);
  assert.equal(pointsForPurchase(10.5), 0);
  assert.equal(pointsForPurchase(Number.NaN), 0);
});
