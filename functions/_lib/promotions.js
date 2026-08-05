// Midnight after December 31, 2026 in Ecuador (UTC-5).
export const WELCOME_POINTS_DEADLINE = Date.parse("2027-01-01T05:00:00.000Z");
export const WELCOME_POINTS_AMOUNT = 100;

export function isWelcomePointsEligible(now = Date.now()) {
  return Number(now) < WELCOME_POINTS_DEADLINE;
}
