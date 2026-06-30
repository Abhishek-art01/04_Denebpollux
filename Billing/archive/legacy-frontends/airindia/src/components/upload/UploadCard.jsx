import React, { useState, useRef } from "react";
import { uploadSheet } from "../../api/uploads.js";

export default function UploadCard({ sheetKey, title, description, onUploaded }) {
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);
    try {
      const result = await uploadSheet(sheetKey, file);
      const warningNote = result.warnings?.length ? ` (${result.warnings.length} warning(s))` : "";
      setStatus({
        type: "success",
        message: `${result.rows_inserted} rows added for ${result.month}${warningNote}.`,
      });
      onUploaded?.();
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail || "Upload failed. Check the file format and try again.";
      setStatus({ type: "error", message: detail });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="upload-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={uploading} />
      {uploading && <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Uploading…</span>}
      {status && <div className={`upload-status ${status.type}`}>{status.message}</div>}
    </div>
  );
}
