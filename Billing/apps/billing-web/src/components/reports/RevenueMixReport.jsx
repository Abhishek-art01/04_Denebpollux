import React, { useEffect, useState } from "react";
import { fetchRevenueMix } from "../../api/reports.js";
import DataTable from "../shared/DataTable.jsx";
import DownloadButton from "../shared/DownloadButton.jsx";
import { LoadingState } from "../shared/EmptyState.jsx";
import { formatINR, formatPercent } from "../../utils/format.js";

export default function RevenueMixReport({ month }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError(null);
    fetchRevenueMix(month)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setError("Could not load revenue mix.");
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <LoadingState message="Loading revenue mix…" />;
  if (error) return <p style={{ color: "var(--negative-600)" }}>{error}</p>;
  if (!report) return null;

  const columns = [
    { key: "revenue_source", label: "Revenue Source" },
    { key: "amount", label: "Amount (₹)", numeric: true, render: (r) => formatINR(r.amount) },
    { key: "percent_of_total", label: "% of Total Revenue", numeric: true, render: (r) => formatPercent(r.percent_of_total) },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent — Revenue Mix</div>
          <h1>Revenue Mix by Source</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="revenue-mix" month={month} filenameHint="Agilent_Revenue_Mix" />
      </div>

      <div className="card">
        <h2 className="card-title">2. Revenue Mix by Source</h2>
        <DataTable
          columns={columns}
          rows={report.items}
          footer={{
            revenue_source: "Total Revenue",
            amount: formatINR(report.total_revenue),
            percent_of_total: "100.00%",
          }}
        />
      </div>
    </div>
  );
}
