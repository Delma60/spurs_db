const SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", GHS: "₵", KES: "KSh", ZAR: "R" };

/** Format minor units (kobo/cents) for display. */
export function formatMoney(minor: number, currency = "NGN"): string {
  const symbol = SYMBOLS[currency] ?? currency + " ";
  return symbol + (minor / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
