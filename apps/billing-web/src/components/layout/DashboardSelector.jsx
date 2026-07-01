import React from "react";
import { useDashboard } from "../../context/DashboardContext.jsx";

export default function DashboardSelector() {
  const { activeDashboard, setActiveDashboard, dashboardOptions } = useDashboard();

  return (
    <div className="select-control">
      <label htmlFor="dashboard-select">Dashboard</label>
      <select
        id="dashboard-select"
        value={activeDashboard}
        onChange={(e) => setActiveDashboard(e.target.value)}
      >
        {dashboardOptions.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
