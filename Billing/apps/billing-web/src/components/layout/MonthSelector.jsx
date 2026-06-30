import React from "react";
import { useDashboard } from "../../context/DashboardContext.jsx";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonthYear(value) {
  if (!value) return "";

  const trimmed = String(value).trim();
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})(?:[-/]\d{1,2})?$/);
  if (isoMatch) {
    const monthIndex = Number(isoMatch[2]) - 1;
    if (monthIndex >= 0 && monthIndex < MONTH_NAMES.length) {
      return `${MONTH_NAMES[monthIndex]}-${isoMatch[1]}`;
    }
  }

  const namedMonthMatch = trimmed.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b[\s,/-]*(\d{4})/i
  );
  if (namedMonthMatch) {
    const monthIndex = MONTH_NAMES.findIndex((month) =>
      namedMonthMatch[1].toLowerCase().startsWith(month.toLowerCase())
    );
    if (monthIndex >= 0) return `${MONTH_NAMES[monthIndex]}-${namedMonthMatch[2]}`;
  }

  return trimmed;
}

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
            {formatMonthYear(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
