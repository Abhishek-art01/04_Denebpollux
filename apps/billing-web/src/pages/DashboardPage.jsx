import React from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { EmptyState } from "../components/shared/EmptyState.jsx";

import PnlSummaryReport from "../components/reports/PnlSummaryReport.jsx";
import RevenueSummaryReport from "../components/reports/RevenueSummaryReport.jsx";
import RevenueMixReport from "../components/reports/RevenueMixReport.jsx";
import VehicleWiseBreakupReport from "../components/reports/VehicleWiseBreakupReport.jsx";
import OwnershipBreakupReport from "../components/reports/OwnershipBreakupReport.jsx";
import VehicleRevenueSummaryReport from "../components/reports/VehicleRevenueSummaryReport.jsx";
import AirIndiaPnlSummaryReport from "../components/reports/AirIndiaPnlSummaryReport.jsx";
import AirIndiaRevenueSummaryReport from "../components/reports/AirIndiaRevenueSummaryReport.jsx";
import AirIndiaVehicleRevenueSummaryReport from "../components/reports/AirIndiaVehicleRevenueSummaryReport.jsx";

const REPORT_COMPONENTS = {
  agilent: {
  "pnl-summary": PnlSummaryReport,
  "revenue-summary": RevenueSummaryReport,
  "revenue-mix": RevenueMixReport,
  "vehicle-breakup": VehicleWiseBreakupReport,
  "ownership-breakup": OwnershipBreakupReport,
  "vehicle-revenue-summary": VehicleRevenueSummaryReport,
  },
  airindia: {
    "pnl-summary": AirIndiaPnlSummaryReport,
    "revenue-summary": AirIndiaRevenueSummaryReport,
    "vehicle-revenue-summary": AirIndiaVehicleRevenueSummaryReport,
  },
};

export default function DashboardPage() {
  const { clientConfig, selectedMonth, activeDashboard, months, monthsLoading, monthsError } = useDashboard();

  if (monthsLoading) return null;

  if (monthsError) {
    return (
      <EmptyState
        title="Billing API unavailable"
        message={monthsError}
      />
    );
  }

  if (months.length === 0) {
    return (
      <EmptyState
        title="No data uploaded yet"
        message={clientConfig.noDataMessage}
      />
    );
  }

  const ReportComponent =
    REPORT_COMPONENTS[clientConfig.id]?.[activeDashboard] ||
    REPORT_COMPONENTS[clientConfig.id]?.[clientConfig.defaultDashboard] ||
    PnlSummaryReport;

  return <ReportComponent month={selectedMonth} />;
}
