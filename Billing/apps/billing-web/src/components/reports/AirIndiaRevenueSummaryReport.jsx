import React, { useEffect, useState } from "react";
import { fetchRevenueSummary } from "../../api/reports.js";
import DataTable from "../shared/DataTable.jsx";
import SummaryCard from "../shared/SummaryCard.jsx";
import DownloadButton from "../shared/DownloadButton.jsx";
import { LoadingState } from "../shared/EmptyState.jsx";
import { formatINR } from "../../utils/format.js";

export default function RevenueSummaryReport({ month }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError(null);
    fetchRevenueSummary(month)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setError("Could not load revenue summary.");
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <LoadingState message="Loading revenue summary…" />;
  if (error) return <p style={{ color: "var(--negative-600)" }}>{error}</p>;
  if (!report) return null;

  const columns = [
    { key: "particulars", label: "Particulars" },
    { key: "amount", label: "Amount (₹)", numeric: true },
  ];

  const rows = [
    { particulars: "Trip_Amount_TERMINAL-3", amount: formatINR(report.trip_amount_t3) },
    { particulars: "TollAmount_TERMINAL-3", amount: formatINR(report.toll_amount_t3) },
    { particulars: "MCD", amount: formatINR(report.mcd) },
    { particulars: "Terminal-3 Driver Penalty", amount: `(${formatINR(report.t3_driver_penalty)})`, negative: true },
    { particulars: "Terminal-3 Employee Penalty", amount: `(${formatINR(report.t3_employee_penalty)})`, negative: true },
    { particulars: "Total Of Terminal3", amount: formatINR(report.total_of_terminal3), strong: true },
    { particulars: "Trip_Amount_AIAA", amount: formatINR(report.trip_amount_aiaa) },
    { particulars: "TollAmount_AIAA", amount: formatINR(report.toll_amount_aiaa) },
    { particulars: "AIAA Driver Penalty", amount: `(${formatINR(report.aiaa_driver_penalty)})`, negative: true },
    { particulars: "AIAA Employee Penalty", amount: `(${formatINR(report.aiaa_employee_penalty)})`, negative: true },
    { particulars: "Total of AIAA", amount: formatINR(report.total_of_aiaa), strong: true },
    { particulars: "Total Taxable Amount", amount: formatINR(report.total_taxable_amount), strong: true },
    {
      particulars: "GST (5% on Total of T-3 + 5% on Total of AIAA)",
      amount: formatINR(report.gst_total),
    },
    {
      particulars: "TOTAL REVENUE (Net Amount Payable by Agilent)",
      amount: formatINR(report.total_revenue),
      strong: true,
    },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent (Air India) — Detailed Revenue Summary</div>
          <h1>Revenue Summary</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="revenue-summary" month={month} filenameHint="AirIndia_Revenue_Summary" />
      </div>

      <div className="kpi-grid">
        <SummaryCard label="Total Revenue" value={formatINR(report.total_revenue)} tone="positive" />
        <SummaryCard label="Total Of Terminal3" value={formatINR(report.total_of_terminal3)} />
        <SummaryCard label="Total of AIAA" value={formatINR(report.total_of_aiaa)} />
        <SummaryCard label="GST (5%+5%)" value={formatINR(report.gst_total)} />
      </div>

      <div className="card">
        <h2 className="card-title">1. Revenue</h2>
        <DataTable
          columns={columns}
          rows={rows}
          rowClassName={(r) => (r.negative ? "row-negative" : r.strong ? "row-label-strong" : "")}
        />
      </div>
    </div>
  );
}
