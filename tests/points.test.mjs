import assert from "node:assert/strict";
import test from "node:test";
import { pointsForPurchase } from "../functions/_lib/points.js";

test("returns one and a half percent of a purchase as cent-valued Traction Points", () => {
  assert.equal(pointsForPurchase(100), 1);
  assert.equal(pointsForPurchase(200), 3);
  assert.equal(pointsForPurchase(3000), 45);
  assert.equal(pointsForPurchase(33000), 495);
});

test("rejects invalid purchase amounts", () => {
  assert.equal(pointsForPurchase(-3000), 0);
  assert.equal(pointsForPurchase(10.5), 0);
  assert.equal(pointsForPurchase(Number.NaN), 0);
});
