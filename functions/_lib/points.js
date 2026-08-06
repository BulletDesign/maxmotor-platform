export const POINT_CASH_VALUE_CENTS = 1;
export const CASHBACK_RATE_BASIS_POINTS = 150;

export function pointsForPurchase(amountCents) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) return 0;
  return Math.floor(amountCents * CASHBACK_RATE_BASIS_POINTS / 10000 / POINT_CASH_VALUE_CENTS);
}
