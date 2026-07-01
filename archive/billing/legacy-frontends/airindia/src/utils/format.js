export function formatINR(amount, { showDecimals = false } = {}) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  const value = Math.round(amount * (showDecimals ? 100 : 1)) / (showDecimals ? 100 : 1);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)}%`;
}

export function formatAmountOrDash(amount) {
  if (!amount) return "-";
  return formatINR(amount);
}
