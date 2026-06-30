import React, { useEffect, useState } from "react";
import { fetchOwnershipBreakup } from "../../api/reports.js";
import DataTable from "../shared/DataTable.jsx";
import DownloadButton from "../shared/DownloadButton.jsx";
import { LoadingState } from "../shared/EmptyState.jsx";
import { formatINR, formatPercent } from "../../utils/format.js";

export default function OwnershipBreakupReport({ month }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError(null);
    fetchOwnershipBreakup(month)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setError("Could not load ownership breakup.");
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <LoadingState message="Loading ownership breakup…" />;
  if (error) return <p style={{ color: "var(--negative-600)" }}>{error}</p>;
  if (!report) return null;

  const columns = [
    { key: "ownership_type", label: "Ownership Type" },
    { key: "total_revenue", label: "Total Revenue (₹)", numeric: true, render: (r) => formatINR(r.total_revenue) },
    { key: "percent_of_total", label: "% of Total", numeric: true, render: (r) => formatPercent(r.percent_of_total) },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent — By Ownership</div>
          <h1>Revenue by Ownership Type</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="ownership-breakup" month={month} filenameHint="Agilent_Ownership_Breakup" />
      </div>

      <div className="card">
        <h2 className="card-title">4. Revenue by Vehicle Ownership Type</h2>
        <DataTable
          columns={columns}
          rows={report.rows}
          footer={{
            ownership_type: "Total",
            total_revenue: formatINR(report.total),
            percent_of_total: "100.00%",
          }}
        />
      </div>
    </div>
  );
}
