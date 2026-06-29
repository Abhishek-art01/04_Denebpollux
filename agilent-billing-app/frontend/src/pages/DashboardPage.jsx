import React from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { EmptyState } from "../components/shared/EmptyState.jsx";

import PnlSummaryReport from "../components/reports/PnlSummaryReport.jsx";
import RevenueSummaryReport from "../components/reports/RevenueSummaryReport.jsx";
import RevenueMixReport from "../components/reports/RevenueMixReport.jsx";
import VehicleWiseBreakupReport from "../components/reports/VehicleWiseBreakupReport.jsx";
import OwnershipBreakupReport from "../components/reports/OwnershipBreakupReport.jsx";
import VehicleRevenueSummaryReport from "../components/reports/VehicleRevenueSummaryReport.jsx";

const REPORT_COMPONENTS = {
  "pnl-summary": PnlSummaryReport,
  "revenue-summary": RevenueSummaryReport,
  "revenue-mix": RevenueMixReport,
  "vehicle-breakup": VehicleWiseBreakupReport,
  "ownership-breakup": OwnershipBreakupReport,
  "vehicle-revenue-summary": VehicleRevenueSummaryReport,
};

export default function DashboardPage() {
  const { selectedMonth, activeDashboard, months, monthsLoading } = useDashboard();

  if (monthsLoading) return null;

  if (months.length === 0) {
    return (
      <EmptyState
        title="No data uploaded yet"
        message="Go to Upload Data to add your TripData, ChildCab, BackupCab, MaintenanceSecurity, SpotRental, and AdditionalCharges sheets for a month. Each sheet must include a Month column."
      />
    );
  }

  const ReportComponent = REPORT_COMPONENTS[activeDashboard] || PnlSummaryReport;

  return <ReportComponent month={selectedMonth} />;
}
