import React, { useEffect, useState } from "react";
import { fetchRevenueSummary } from "../../api/reports.js";
import DataTable from "../shared/DataTable.jsx";
import SummaryCard from "../shared/SummaryCard.jsx";
import DownloadButton from "../shared/DownloadButton.jsx";
import { LoadingState } from "../shared/EmptyState.jsx";
import { formatAmountOrDash, formatINR } from "../../utils/format.js";

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
    { key: "cgst", label: "(+) CGST @ 9%", numeric: true },
    { key: "sgst", label: "(+) SGST @ 9%", numeric: true },
    { key: "total", label: "Total", numeric: true },
  ];

  const rows = [
    { particulars: "Total Trip Amount", amount: formatAmountOrDash(report.total_trip_amount), cgst: "-", sgst: "-", total: "-" },
    { particulars: "(+) Maintenance Charges", amount: formatAmountOrDash(report.maintenance_charges), cgst: "-", sgst: "-", total: "-" },
    { particulars: "(+) Creche Duty Charges", amount: formatAmountOrDash(report.creche_duty_charges), cgst: "-", sgst: "-", total: "-" },
    { particulars: "(+) Odd Hours Cab Cost", amount: formatAmountOrDash(report.odd_hours_cab_cost), cgst: "-", sgst: "-", total: "-" },
    {
      particulars: "Grand Total (Billable Trip Charges)",
      amount: formatINR(report.grand_total_billable),
      cgst: "-",
      sgst: "-",
      total: "-",
      strong: true,
    },
    {
      particulars: "(-) Amount Recovered from Employees",
      amount: formatINR(report.amount_recovered_from_employees),
      cgst: "-",
      sgst: "-",
      total: formatINR(report.amount_recovered_from_employees),
      negative: true,
    },
    {
      particulars: "Taxable Trip Amount",
      amount: formatINR(report.taxable_trip_amount),
      cgst: formatINR(report.taxable_trip_cgst),
      sgst: formatINR(report.taxable_trip_sgst),
      total: formatINR(report.taxable_trip_total),
      strong: true,
    },
    {
      particulars: "(+) Manpower Charges",
      amount: formatAmountOrDash(report.manpower_charges),
      cgst: formatAmountOrDash(report.manpower_cgst),
      sgst: formatAmountOrDash(report.manpower_sgst),
      total: formatAmountOrDash(report.manpower_total),
    },
    {
      particulars: "(+) Technology Cost Recovery",
      amount: formatAmountOrDash(report.technology_cost_recovery),
      cgst: formatAmountOrDash(report.technology_cgst),
      sgst: formatAmountOrDash(report.technology_sgst),
      total: formatAmountOrDash(report.technology_total),
    },
    {
      particulars: "(+) Dashcam Subscription Recovery",
      amount: formatAmountOrDash(report.dashcam_subscription_recovery),
      cgst: formatAmountOrDash(report.dashcam_cgst),
      sgst: formatAmountOrDash(report.dashcam_sgst),
      total: formatAmountOrDash(report.dashcam_total),
    },
    {
      particulars: "(+) Razorpay Transaction Fee Recovery",
      amount: formatAmountOrDash(report.razorpay_fee_recovery),
      cgst: formatAmountOrDash(report.razorpay_cgst),
      sgst: formatAmountOrDash(report.razorpay_sgst),
      total: formatAmountOrDash(report.razorpay_total),
    },
    {
      particulars: "(+) Spot Rental Revenue",
      amount: formatAmountOrDash(report.spot_rental_revenue),
      cgst: formatAmountOrDash(report.spot_rental_cgst),
      sgst: formatAmountOrDash(report.spot_rental_sgst),
      total: formatAmountOrDash(report.spot_rental_total),
    },
    {
      particulars: "Total Taxable Amount",
      amount: formatINR(report.total_taxable_amount),
      cgst: formatINR(report.cgst_total),
      sgst: formatINR(report.sgst_total),
      total: formatINR(report.net_amount_payable_by_agilent),
      strong: true,
    },
    {
      particulars: "Net Amount Payable by Agilent",
      amount: formatINR(report.net_amount_payable_by_agilent),
      cgst: "-",
      sgst: "-",
      total: "-",
      strong: true,
    },
    {
      particulars: "TOTAL REVENUE",
      amount: formatINR(report.total_revenue),
      cgst: "-",
      sgst: "-",
      total: "-",
      strong: true,
    },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent — Detailed Revenue Summary</div>
          <h1>Revenue Summary</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="revenue-summary" month={month} filenameHint="Agilent_Revenue_Summary" />
      </div>

      <div className="kpi-grid">
        <SummaryCard label="Total Revenue" value={formatINR(report.total_revenue)} tone="positive" />
        <SummaryCard label="Grand Total (Billable)" value={formatINR(report.grand_total_billable)} />
        <SummaryCard label="Amount Recovered" value={formatINR(report.amount_recovered_from_employees)} tone="negative" />
        <SummaryCard label="Spot Rental Revenue" value={formatINR(report.spot_rental_revenue)} />
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
