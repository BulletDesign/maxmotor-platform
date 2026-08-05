import test from "node:test";
import assert from "node:assert/strict";
import { isWelcomePointsEligible, WELCOME_POINTS_AMOUNT } from "../functions/_lib/promotions.js";
import { onRequest } from "../functions/_middleware.js";

test("awards 100 welcome TP through December 31 in Ecuador", () => {
  assert.equal(WELCOME_POINTS_AMOUNT, 100);
  assert.equal(isWelcomePointsEligible(Date.parse("2027-01-01T04:59:59.999Z")), true);
});

test("stops the welcome award at midnight on January 1 in Ecuador", () => {
  assert.equal(isWelcomePointsEligible(Date.parse("2027-01-01T05:00:00.000Z")), false);
});

test("redirects technical Pages URLs to the production host", async () => {
  const response = await onRequest({
    request: new Request("https://preview.maxmotor-platform.pages.dev/portal?tab=register"),
    next: () => { throw new Error("Technical hosts must not continue"); },
  });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://maxmotor4x4.com/portal?tab=register");
});

test("canonicalizes the legacy customer portal URL", async () => {
  const response = await onRequest({
    request: new Request("https://maxmotor4x4.com/portal?tab=register"),
    next: () => { throw new Error("Legacy portal must not continue"); },
  });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://maxmotor4x4.com/MiMaxmotor?tab=register");
});

test("does not expose the legacy superadmin route", async () => {
  const response = await onRequest({
    request: new Request("https://maxmotor4x4.com/portal-superadmin"),
    next: () => { throw new Error("Legacy console route must not continue"); },
  });
  assert.equal(response.status, 404);
});

test("serves the production host without redirecting", async () => {
  const expected = new Response("production");
  const response = await onRequest({
    request: new Request("https://maxmotor4x4.com/"),
    next: () => expected,
  });
  assert.equal(response, expected);
});
