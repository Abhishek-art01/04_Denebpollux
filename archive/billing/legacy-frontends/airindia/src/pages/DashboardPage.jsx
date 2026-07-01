import React from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { EmptyState } from "../components/shared/EmptyState.jsx";

import PnlSummaryReport from "../components/reports/PnlSummaryReport.jsx";
import RevenueSummaryReport from "../components/reports/RevenueSummaryReport.jsx";
import VehicleRevenueSummaryReport from "../components/reports/VehicleRevenueSummaryReport.jsx";

const REPORT_COMPONENTS = {
  "pnl-summary": PnlSummaryReport,
  "revenue-summary": RevenueSummaryReport,
  "vehicle-revenue-summary": VehicleRevenueSummaryReport,
};

export default function DashboardPage() {
  const { selectedMonth, activeDashboard, months, monthsLoading } = useDashboard();

  if (monthsLoading) return null;

  if (months.length === 0) {
    return (
      <EmptyState
        title="No data uploaded yet"
        message="Go to Upload Data to add your Trip_Data_TERMINAL-3, Trip_Data_AIAA, SUNDRIES, and penalty_VehicleWise sheets for a month. Each sheet must include Month and Ownership columns."
      />
    );
  }

  const ReportComponent = REPORT_COMPONENTS[activeDashboard] || PnlSummaryReport;
  return <ReportComponent month={selectedMonth} />;
}
