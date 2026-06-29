import React, { useEffect, useState } from "react";
import { fetchVehicleRevenueSummary } from "../../api/reports.js";
import DataTable from "../shared/DataTable.jsx";
import DownloadButton from "../shared/DownloadButton.jsx";
import { LoadingState } from "../shared/EmptyState.jsx";
import { formatAmountOrDash, formatINR } from "../../utils/format.js";

export default function VehicleRevenueSummaryReport({ month }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError(null);
    fetchVehicleRevenueSummary(month)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setError("Could not load vehicle revenue summary.");
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <LoadingState message="Loading vehicle revenue summary…" />;
  if (error) return <p style={{ color: "var(--negative-600)" }}>{error}</p>;
  if (!report) return null;

  const columns = [
    { key: "vehicle_number", label: "VehicleNumber" },
    { key: "ownership", label: "Ownership" },
    { key: "trip_data_amount", label: "TripDataAmount", numeric: true, render: (r) => formatAmountOrDash(r.trip_data_amount) },
    { key: "spot_rental", label: "SpotRentel", numeric: true, render: (r) => formatAmountOrDash(r.spot_rental) },
    { key: "maintenance_veh_amount", label: "MaintainenceVehAmount", numeric: true, render: (r) => formatAmountOrDash(r.maintenance_veh_amount) },
    { key: "child_cab_amount", label: "ChildCabAmount", numeric: true, render: (r) => formatAmountOrDash(r.child_cab_amount) },
    { key: "backup_cabs_amount", label: "BackupCabsAmount", numeric: true, render: (r) => formatAmountOrDash(r.backup_cabs_amount) },
    { key: "grand_total", label: "GrandTotal", numeric: true, render: (r) => formatINR(r.grand_total) },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent — Vehicle Revenue (TripCost basis)</div>
          <h1>Vehicle Revenue Summary</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="vehicle-revenue-summary" month={month} filenameHint="Agilent_Vehicle_Revenue_Summary" />
      </div>

      <div className="card">
        <h2 className="card-title">5. Vehicle Revenue Summary</h2>
        <p style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: -6, marginBottom: 14 }}>
          Uses TripData gross TripCost (not Taxable Amount). Spot Rental = Without GST Total Amount − Total Billing Items Amount.
        </p>
        <DataTable
          columns={columns}
          rows={report.rows}
          footer={{
            vehicle_number: "Grand Total",
            ownership: "",
            trip_data_amount: formatINR(report.grand_total_trip_data),
            spot_rental: formatINR(report.grand_total_spot_rental),
            maintenance_veh_amount: formatINR(report.grand_total_maintenance),
            child_cab_amount: formatINR(report.grand_total_child_cab),
            backup_cabs_amount: formatINR(report.grand_total_backup_cab),
            grand_total: formatINR(report.grand_total_overall),
          }}
        />
      </div>
    </div>
  );
}
