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
    { key: "veh_type", label: "Vehtype" },
    { key: "t3_amount", label: "T-3Amount", numeric: true, render: (r) => formatAmountOrDash(r.t3_amount) },
    { key: "aiaa_amount", label: "AIAAamount", numeric: true, render: (r) => formatAmountOrDash(r.aiaa_amount) },
    { key: "total", label: "Total", numeric: true, render: (r) => formatINR(r.total) },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent (Air India) — By Vehicle</div>
          <h1>Vehicle Revenue Summary</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="vehicle-revenue-summary" month={month} filenameHint="AirIndia_Vehicle_Revenue_Summary" />
      </div>

      <div className="card">
        <h2 className="card-title">2. Vehicle Revenue Summary</h2>
        <p style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: -6, marginBottom: 14 }}>
          T-3Amount = Sum of TripCost − Penalty (Terminal-3). AIAAamount = Sum of TripCost − Penalty (AIAA).
        </p>
        <DataTable
          columns={columns}
          rows={report.rows}
          footer={{
            vehicle_number: "Grand Total",
            ownership: "",
            veh_type: "",
            t3_amount: formatINR(report.grand_total_t3),
            aiaa_amount: formatINR(report.grand_total_aiaa),
            total: formatINR(report.grand_total_overall),
          }}
        />
      </div>
    </div>
  );
}
