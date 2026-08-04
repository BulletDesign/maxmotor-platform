import assert from "node:assert/strict";
import test from "node:test";
import { pointsForPurchase } from "../functions/_lib/points.js";

test("awards one point for every ten dollars", () => {
  assert.equal(pointsForPurchase(999), 0);
  assert.equal(pointsForPurchase(1000), 1);
  assert.equal(pointsForPurchase(10999), 10);
  assert.equal(pointsForPurchase(11000), 11);
});

test("rejects invalid purchase amounts", () => {
  assert.equal(pointsForPurchase(-1000), 0);
  assert.equal(pointsForPurchase(10.5), 0);
  assert.equal(pointsForPurchase(Number.NaN), 0);
});
