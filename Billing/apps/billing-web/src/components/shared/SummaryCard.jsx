import React from "react";

/**
 * A single KPI tile, e.g. "Total Revenue: ₹45,86,379".
 * tone: "default" | "positive" | "negative" - colors the value.
 */
export default function SummaryCard({ label, value, tone = "default" }) {
  return (
    <div className={`kpi-card ${tone !== "default" ? tone : ""}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
