import React from "react";
import { useDashboard } from "../../context/DashboardContext.jsx";

export default function MonthSelector() {
  const { months, monthsLoading, selectedMonth, setSelectedMonth } = useDashboard();

  return (
    <div className="select-control">
      <label htmlFor="month-select">Month</label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        disabled={monthsLoading || months.length === 0}
      >
        {months.length === 0 && <option value="">No data uploaded</option>}
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
