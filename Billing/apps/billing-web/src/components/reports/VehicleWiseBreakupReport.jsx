import React, { useEffect, useState } from "react";
import { fetchVehicleWiseBreakup } from "../../api/reports.js";
import DataTable from "../shared/DataTable.jsx";
import DownloadButton from "../shared/DownloadButton.jsx";
import { LoadingState } from "../shared/EmptyState.jsx";
import { formatAmountOrDash, formatINR, formatPercent } from "../../utils/format.js";

export default function VehicleWiseBreakupReport({ month }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError(null);
    fetchVehicleWiseBreakup(month)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setError("Could not load vehicle-wise breakup.");
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <LoadingState message="Loading vehicle-wise breakup…" />;
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
    { key: "percent_of_total", label: "% of Total", numeric: true, render: (r) => formatPercent(r.percent_of_total) },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent — By Vehicle</div>
          <h1>Vehicle-wise Revenue Breakup</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="vehicle-breakup" month={month} filenameHint="Agilent_Vehicle_Wise_Breakup" />
      </div>

      <div className="card">
        <h2 className="card-title">3. Vehicle-wise Revenue Breakup</h2>
        <DataTable
          columns={columns}
          rows={report.rows}
          footer={{
            vehicle_number: "GRAND TOTAL",
            ownership: "",
            trip_data_amount: formatINR(report.grand_total_trip_data),
            spot_rental: formatINR(report.grand_total_spot_rental),
            maintenance_veh_amount: formatINR(report.grand_total_maintenance),
            child_cab_amount: formatINR(report.grand_total_child_cab),
            backup_cabs_amount: formatINR(report.grand_total_backup_cab),
            grand_total: formatINR(report.grand_total_overall),
            percent_of_total: "100.00%",
          }}
        />
      </div>
    </div>
  );
}
