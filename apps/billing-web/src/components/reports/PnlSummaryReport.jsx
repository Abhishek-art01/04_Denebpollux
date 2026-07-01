import React, { useEffect, useState } from "react";
import { fetchPnlSummary } from "../../api/reports.js";
import DataTable from "../shared/DataTable.jsx";
import SummaryCard from "../shared/SummaryCard.jsx";
import DownloadButton from "../shared/DownloadButton.jsx";
import { LoadingState } from "../shared/EmptyState.jsx";
import { formatINR, formatPercent } from "../../utils/format.js";

export default function PnlSummaryReport({ month }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError(null);
    fetchPnlSummary(month)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setError("Could not load PNL summary.");
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <LoadingState message="Loading PNL summary…" />;
  if (error) return <p style={{ color: "var(--negative-600)" }}>{error}</p>;
  if (!report) return null;

  const isProfit = report.net_profit_loss >= 0;

  const columns = [
    { key: "particulars", label: "Particulars" },
    { key: "amount", label: "Amount (₹)", numeric: true, render: (r) => formatINR(r.amount) },
    { key: "percent_of_sale", label: "% of Sale", numeric: true, render: (r) => formatPercent(r.percent_of_sale) },
  ];

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Agilent — MIS Report</div>
          <h1>PNL / MIS Summary</h1>
          <div className="report-period">{report.month}</div>
        </div>
        <DownloadButton reportType="pnl-summary" month={month} filenameHint="Agilent_PNL_Summary" />
      </div>

      <div className="kpi-grid">
        <SummaryCard label="Total Revenue" value={formatINR(report.total_revenue)} tone="positive" />
        <SummaryCard label="Total Expenses" value={formatINR(report.total_expenses)} />
        <SummaryCard
          label={isProfit ? "Net Profit" : "Net Loss"}
          value={formatINR(Math.abs(report.net_profit_loss))}
          tone={isProfit ? "positive" : "negative"}
        />
        <SummaryCard label="Net Margin" value={formatPercent(report.net_margin_percent)} tone={isProfit ? "positive" : "negative"} />
      </div>

      <div className="card">
        <h2 className="card-title">Revenue</h2>
        <DataTable
          columns={columns}
          rows={[{ particulars: "TOTAL REVENUE", amount: report.total_revenue, percent_of_sale: 100 }]}
        />
      </div>

      <div className="card">
        <h2 className="card-title">Expenses</h2>
        <DataTable
          columns={columns}
          rows={report.expenses}
          footer={{
            particulars: "TOTAL EXPENSES",
            amount: formatINR(report.total_expenses),
            percent_of_sale: formatPercent(
              report.total_revenue ? (report.total_expenses / report.total_revenue) * 100 : 0
            ),
          }}
        />
      </div>

      <div className="card">
        <h2 className="card-title">Profitability</h2>
        <DataTable
          columns={columns}
          rows={[
            {
              particulars: isProfit ? "NET PROFIT" : "NET LOSS",
              amount: report.net_profit_loss,
              percent_of_sale: report.net_margin_percent,
            },
          ]}
          rowClassName={() => (isProfit ? "" : "row-negative")}
        />
      </div>
    </div>
  );
}
