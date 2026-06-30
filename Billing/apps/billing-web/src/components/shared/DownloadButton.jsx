import React, { useState } from "react";
import { triggerDownload } from "../../api/reports.js";

/**
 * Always-visible download button for the currently active report.
 * reportType matches the export router's REPORT_REGISTRY keys.
 */
export default function DownloadButton({ reportType, month, filenameHint, disabled }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setDownloading(true);
    setError(null);
    try {
      await triggerDownload(reportType, month, filenameHint);
    } catch (err) {
      console.error("Download failed", err);
      setError("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      <button className="btn-download" onClick={handleClick} disabled={disabled || downloading}>
        {downloading ? "Preparing…" : "⬇ Download"}
      </button>
      {error && <span style={{ fontSize: 12, color: "var(--negative-600)" }}>{error}</span>}
    </div>
  );
}
