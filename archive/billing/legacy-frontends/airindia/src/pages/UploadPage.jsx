import React from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import UploadCard from "../components/upload/UploadCard.jsx";
import ManualInputForm from "../components/upload/ManualInputForm.jsx";
import MonthSelector from "../components/layout/MonthSelector.jsx";

const SHEETS = [
  {
    key: "tripDataTerminal3",
    title: "Trip_Data_TERMINAL-3",
    description: "S.NO, TripType, STAFF COUNT, BILL MAKE, DATE, DUTY TYPE, CabNo., Cab Type, Ownership, TollAmount, TripCost, TaxableAmount, and other duty/route columns, plus Month.",
  },
  {
    key: "tripDataAIAA",
    title: "Trip_Data_AIAA",
    description: "SR NO, STAFF, BILL COUNT, Date, DUTY TYPE, CAB NO, CAB TYPE, Ownership, toll amount, TripCost, Total, and other duty/route columns, plus Month.",
  },
  {
    key: "sundries",
    title: "SUNDRIES",
    description: "Vehicle No. (billing-name, used to match CabNo./CAB NO), VEH. NO. (registration, display only), VEH. TYPE, Ownership, MCD, No. of working Days, plus Month.",
  },
  {
    key: "penaltyVehicleWise",
    title: "penalty_VehicleWise",
    description: "vehicleNO, Amount, Remark, Entity (must be \"T-3\" or \"AIAA\" — required to attribute the penalty correctly), Ownership, plus Month.",
  },
];

export default function UploadPage() {
  const { selectedMonth, refreshMonths } = useDashboard();

  return (
    <div>
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Data Upload</div>
          <h1>Upload Monthly Sheets</h1>
          <div className="report-period">
            Each Excel file must include <strong>Month</strong> and <strong>Ownership</strong> columns
            filled in before upload. <strong>penalty_VehicleWise</strong> also needs an <strong>Entity</strong> column
            ("T-3" or "AIAA").
          </div>
        </div>
      </div>

      <div className="upload-grid">
        {SHEETS.map((sheet) => (
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
        <h2 className="card-title" style={{ border: "none", margin: 0, padding: 0 }}>
          Manual inputs apply to the selected month
        </h2>
        <MonthSelector />
      </div>

      {selectedMonth ? (
        <ManualInputForm month={selectedMonth} />
      ) : (
        <p style={{ color: "var(--ink-400)" }}>Upload a sheet first to select a month for manual inputs.</p>
      )}
    </div>
  );
}
