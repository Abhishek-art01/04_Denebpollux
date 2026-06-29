import React from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import UploadCard from "../components/upload/UploadCard.jsx";
import ManualInputForm from "../components/upload/ManualInputForm.jsx";
import MonthSelector from "../components/layout/MonthSelector.jsx";

const SHEETS = [
  {
    key: "tripData",
    title: "TripData",
    description: "Plan ID, Roster Employee's, Shift, Direction, Shift Date, VehicleNumber, Ownership, Driver Name, Make, Zone Name, Billing Zone, TripCost, MCD, HR Tax, Raj. & UP Tax, FBD/Bijwasan/Manesar Toll, Taxable Amount, Toll, Remarks, Month.",
  },
  {
    key: "childCab",
    title: "ChildCab",
    description: "S. No, Date, Employee Name, Time Period, Chauffer Name, VehicleNumber, Ownership, TripCost, Location, Month.",
  },
  {
    key: "backupCab",
    title: "BackupCab",
    description: "Date, Time Period, Time Period 2, VehicleNumber, Ownership, TripCost, Cab Details, Location, Remark, Month.",
  },
  {
    key: "maintenanceSecurity",
    title: "MaintenanceSecurity",
    description: "Dated, Shift time, VehicleNumber, Ownership, TripCost, Make, Driver, Location, Order, Month.",
  },
  {
    key: "spotRental",
    title: "SpotRental",
    description: "Start Date, End Date, Status, Duty Id, VehicleNumber, Ownership, Total Billing Items Amount, Without GST Total Amount, Invoice Amount, and other duty/tax columns, plus Month.",
  },
  {
    key: "additionalCharges",
    title: "AdditionalCharges",
    description: "Description, Taxable Amt., GST@18%, Total Amt., Month. Description should mention Manpower / Technology / Dashcam / Razorpay for auto-categorization.",
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
            Each Excel file must include a <strong>Month</strong> column (e.g. "May-2026") filled in before upload.
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
        <div>
          <h2 className="card-title" style={{ border: "none", margin: 0, padding: 0 }}>
            Manual inputs apply to the selected month
          </h2>
        </div>
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
