import React from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import UploadCard from "../components/upload/UploadCard.jsx";
import ManualInputForm from "../components/upload/ManualInputForm.jsx";
import AirIndiaManualInputForm from "../components/upload/AirIndiaManualInputForm.jsx";
import MonthSelector from "../components/layout/MonthSelector.jsx";

export default function UploadPage() {
  const { clientConfig, selectedMonth, refreshMonths } = useDashboard();
  const ManualInputs = clientConfig.id === "airindia" ? AirIndiaManualInputForm : ManualInputForm;

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Data Upload</div>
          <h1>Upload {clientConfig.name} Monthly Sheets</h1>
          <div className="report-period">
            Each Excel file must include a <strong>Month</strong> column (e.g. "May-2026") filled in before upload.
          </div>
        </div>
      </div>

      <div className="upload-grid">
        {clientConfig.sheets.map((sheet) => (
          <UploadCard
            key={sheet.key}
            sheetKey={sheet.key}
            title={sheet.title}
            description={sheet.description}
            onUploaded={refreshMonths}
          />
        ))}
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 className="card-title" style={{ border: "none", margin: 0, padding: 0 }}>
            Manual inputs apply to the selected month
          </h2>
        </div>
        <MonthSelector />
      </div>

      {selectedMonth ? (
        <ManualInputs month={selectedMonth} />
      ) : (
        <p style={{ color: "var(--ink-400)" }}>Upload a sheet first to select a month for manual inputs.</p>
      )}
    </div>
  );
}
