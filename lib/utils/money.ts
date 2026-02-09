/**
 * Currency formatting helpers.
 *
 * Keep these utilities small + dependency-free so they can be used
 * in server routes and prompt-building code.
 */

export function formatMoney(
  amount: number,
  currency: string = "USD",
  options?: { maximumFractionDigits?: number }
): string {
  const maximumFractionDigits = options?.maximumFractionDigits ?? 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    const rounded = maximumFractionDigits === 0 ? Math.round(amount) : amount;
    return `${currency} ${rounded}`;
  }
}

