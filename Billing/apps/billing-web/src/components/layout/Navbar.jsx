import React, { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import MonthSelector from "./MonthSelector.jsx";
import DashboardSelector from "./DashboardSelector.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getClientConfig } from "../../config/clients.js";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { uploadSheet } from "../../api/uploads.js";

const AGILENT_UPLOAD_LABELS = {
  childCab: "Agilent Child Cab",
  tripData: "Agilent Trip Data",
  backupCab: "Agilent Backup Cabs",
  maintenanceSecurity: "Agilent Maintainence Cabs",
  spotRental: "Agilent Spot Rental",
  additionalCharges: "Agilent Addtional Charges",
};

export default function Navbar() {
  const { selectedClient } = useAuth();
  const clientConfig = getClientConfig(selectedClient);
  const { months, monthsLoading, refreshMonths } = useDashboard();
  const fileInputRef = useRef(null);
  const [pendingSheetKey, setPendingSheetKey] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const uploadOptions =
    clientConfig.id === "agilent"
      ? clientConfig.sheets
          .filter((sheet) => AGILENT_UPLOAD_LABELS[sheet.key])
          .map((sheet) => ({ ...sheet, title: AGILENT_UPLOAD_LABELS[sheet.key] }))
      : clientConfig.sheets;

  function handleUploadSelection(event) {
    const sheetKey = event.target.value;
    setUploadStatus("");
    setPendingSheetKey(sheetKey);
    if (sheetKey && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  async function handleFileSelection(event) {
    const file = event.target.files?.[0];
    if (!file || !pendingSheetKey) return;

    const selectedSheet = uploadOptions.find((sheet) => sheet.key === pendingSheetKey);
    setUploadStatus(`Uploading ${selectedSheet?.title || "sheet"}...`);
    try {
      await uploadSheet(pendingSheetKey, file);
      await refreshMonths();
      setUploadStatus(`Uploaded ${selectedSheet?.title || "sheet"}`);
    } catch (error) {
      console.error(error);
      const detail = error?.response?.data?.detail;
      if (!detail) {
        try {
          const latestMonths = await refreshMonths();
          const dataIsVisible = Array.isArray(latestMonths) && latestMonths.length > 0 && latestMonths.length >= months.length;
          if (dataIsVisible) {
            setUploadStatus("Upload submitted; confirmation was interrupted. Data refreshed.");
            return;
          }
        } catch (refreshError) {
          console.error(refreshError);
        }
      }
      const message = detail || "Upload confirmation was interrupted. Check the dashboard before retrying.";
      setUploadStatus(`Upload failed: ${message}`);
    } finally {
      event.target.value = "";
      setPendingSheetKey("");
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <span className="brand-name">{clientConfig.name}</span>
          <span className="brand-sub">{clientConfig.subtitle}</span>
        </div>
        <nav className="navbar-actions" aria-label="Workspace navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <div className="upload-select-wrap">
            <label className="sr-only" htmlFor="header-upload-select">Upload Data</label>
            <select
              id="header-upload-select"
              className="header-upload-select"
              value={pendingSheetKey}
              onChange={handleUploadSelection}
            >
              <option value="">Upload Data</option>
              {uploadOptions.map((sheet) => (
                <option key={sheet.key} value={sheet.key}>
                  {sheet.title}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
            <input
              ref={fileInputRef}
              className="hidden-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelection}
            />
            {uploadStatus && <span className="upload-inline-status">{uploadStatus}</span>}
          </div>
        </nav>
      </div>

      <div className="navbar-controls">
        <button
          className="icon-button"
          type="button"
          onClick={refreshMonths}
          disabled={monthsLoading}
          title={monthsLoading ? "Refreshing" : "Refresh billing data"}
          aria-label={monthsLoading ? "Refreshing billing data" : "Refresh billing data"}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            refresh
          </span>
        </button>
        <DashboardSelector />
        <MonthSelector />
      </div>
    </header>
  );
}
