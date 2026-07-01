import React from "react";

export default function SummaryCard({ label, value, tone = "default" }) {
  return (
    <div className={`kpi-card ${tone !== "default" ? tone : ""}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
