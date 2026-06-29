import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMonths } from "../api/reports.js";

const DashboardContext = createContext(null);

export const DASHBOARD_OPTIONS = [
  { key: "pnl-summary", label: "PNL / MIS Summary" },
  { key: "revenue-summary", label: "Detailed Revenue Summary" },
  { key: "revenue-mix", label: "Revenue Mix by Source" },
  { key: "vehicle-breakup", label: "Vehicle-wise Revenue Breakup" },
  { key: "ownership-breakup", label: "Revenue by Ownership Type" },
  { key: "vehicle-revenue-summary", label: "Vehicle Revenue Summary" },
];

export function DashboardProvider({ children }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [activeDashboard, setActiveDashboard] = useState("pnl-summary"); // default per spec
  const [monthsLoading, setMonthsLoading] = useState(true);

  const refreshMonths = useCallback(async () => {
    setMonthsLoading(true);
    try {
      const result = await fetchMonths();
      setMonths(result);
      if (result.length > 0 && !selectedMonth) {
        setSelectedMonth(result[result.length - 1]); // default to most recent month
      }
    } catch (err) {
      console.error("Failed to load months", err);
    } finally {
      setMonthsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshMonths();
  }, [refreshMonths]);

  return (
    <DashboardContext.Provider
      value={{
        months,
        monthsLoading,
        selectedMonth,
        setSelectedMonth,
        activeDashboard,
        setActiveDashboard,
        refreshMonths,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
}
