import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMonths } from "../api/reports.js";
import { useAuth } from "./AuthContext.jsx";
import { getClientConfig } from "../config/clients.js";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { selectedClient } = useAuth();
  const clientConfig = getClientConfig(selectedClient);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [activeDashboard, setActiveDashboard] = useState(clientConfig.defaultDashboard);
  const [monthsLoading, setMonthsLoading] = useState(true);
  const [monthsError, setMonthsError] = useState("");

  const refreshMonths = useCallback(async () => {
    setMonthsLoading(true);
    setMonthsError("");
    try {
      const result = await fetchMonths();
      setMonths(result);
      if (result.length > 0 && !selectedMonth) {
        setSelectedMonth(result[result.length - 1]); // default to most recent month
      }
      return result;
    } catch (err) {
      console.error("Failed to load months", err);
      setMonths([]);
      setSelectedMonth("");
      setMonthsError(
        "Unable to reach the billing API gateway. Check that VITE_API_BASE_URL points to the gateway /api URL."
      );
      return [];
    } finally {
      setMonthsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, selectedMonth]);

  useEffect(() => {
    refreshMonths();
  }, [refreshMonths]);

  useEffect(() => {
    setSelectedMonth("");
    setActiveDashboard(clientConfig.defaultDashboard);
  }, [selectedClient, clientConfig.defaultDashboard]);

  useEffect(() => {
    if (!clientConfig.dashboards.some((dashboard) => dashboard.key === activeDashboard)) {
      setActiveDashboard(clientConfig.defaultDashboard);
    }
  }, [activeDashboard, clientConfig]);

  return (
    <DashboardContext.Provider
      value={{
        clientConfig,
        dashboardOptions: clientConfig.dashboards,
        months,
        monthsLoading,
        monthsError,
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
