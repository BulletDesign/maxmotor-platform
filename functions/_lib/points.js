export const POINT_VALUE_CENTS = 1000;

export function pointsForPurchase(amountCents) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) return 0;
  return Math.floor(amountCents / POINT_VALUE_CENTS);
}
