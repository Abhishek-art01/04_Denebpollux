/**
 * Formats a number as Indian Rupees using the en-IN locale, which
 * applies lakh/crore comma grouping automatically, e.g. 3118989.76 -> "₹31,18,990"
 */
export function formatINR(amount, { showDecimals = false } = {}) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  const value = Math.round(amount * (showDecimals ? 100 : 1)) / (showDecimals ? 100 : 1);
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
  return formatted;
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)}%`;
}

/** Renders "-" for zero amounts in tables, matching the sample report style. */
export function formatAmountOrDash(amount) {
  if (!amount) return "-";
  return formatINR(amount);
}
