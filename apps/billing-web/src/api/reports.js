import client, { API_BASE_URL, clientPath } from "./client.js";
import * as XLSX from "xlsx";

export async function fetchMonths() {
  const { data } = await client.get(clientPath("/months"));
  if (!data || !Array.isArray(data.months)) {
    throw new Error("API did not return a valid months list");
  }
  return data.months;
}

export async function fetchRevenueSummary(month) {
  const { data } = await client.get(clientPath("/reports/revenue-summary"), { params: { month } });
  return data;
}

export async function fetchRevenueMix(month) {
  const { data } = await client.get(clientPath("/reports/revenue-mix"), { params: { month } });
  return data;
}

export async function fetchVehicleWiseBreakup(month) {
  const { data } = await client.get(clientPath("/reports/vehicle-wise-breakup"), { params: { month } });
  return data;
}

export async function fetchOwnershipBreakup(month) {
  const { data } = await client.get(clientPath("/reports/ownership-breakup"), { params: { month } });
  return data;
}

export async function fetchVehicleRevenueSummary(month) {
  const { data } = await client.get(clientPath("/reports/vehicle-revenue-summary"), { params: { month } });
  return data;
}

export async function fetchPnlSummary(month) {
  const { data } = await client.get(clientPath("/reports/pnl-summary"), { params: { month } });
  return data;
}

export function downloadReportUrl(reportType, month) {
  return `${API_BASE_URL}${clientPath(`/export/${reportType}`)}?month=${encodeURIComponent(month)}`;
}

function humanizeKey(key) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeSheetName(name) {
  return name.replace(/[\][*?/\\:]/g, " ").slice(0, 31) || "Report";
}

function safeFilenamePart(value) {
  return String(value).replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "");
}

function addRowsFromObjects(rows, objects) {
  if (!objects.length) {
    rows.push(["No rows"]);
    return;
  }
  const headers = Object.keys(objects[0]);
  rows.push(headers.map(humanizeKey));
  for (const item of objects) {
    rows.push(headers.map((key) => item[key]));
  }
}

function reportToRows(reportType, report) {
  const rows = [[humanizeKey(reportType)], [`Month: ${report.month || ""}`], []];

  if (Array.isArray(report.rows)) {
    addRowsFromObjects(rows, report.rows);
  } else if (Array.isArray(report.items)) {
    addRowsFromObjects(rows, report.items);
  } else if (Array.isArray(report.expenses)) {
    addRowsFromObjects(rows, report.expenses);
  } else {
    const expenseRows = Object.values(report).filter((value) => value && typeof value === "object" && "particulars" in value);
    if (expenseRows.length) {
      addRowsFromObjects(rows, expenseRows);
    } else {
      rows.push(["Particulars", "Amount"]);
      for (const [key, value] of Object.entries(report)) {
        if (key !== "month") rows.push([humanizeKey(key), value]);
      }
    }
  }

  const summary = Object.entries(report).filter(([key, value]) => (
    key !== "month" && !Array.isArray(value) && !(value && typeof value === "object")
  ));
  if (summary.length) {
    rows.push([], ["Summary"]);
    for (const [key, value] of summary) rows.push([humanizeKey(key), value]);
  }

  return rows;
}

function fitColumns(worksheet, rows) {
  worksheet["!cols"] = rows[0]?.map((_, colIndex) => ({
    wch: Math.min(
      42,
      Math.max(12, ...rows.map((row) => String(row[colIndex] ?? "").length + 2)),
    ),
  }));
}

export async function triggerDownload(reportType, month, filenameHint) {
  const { data } = await client.get(clientPath(`/reports/${reportType}`), {
    params: { month },
  });
  const rows = reportToRows(reportType, data);
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  fitColumns(worksheet, rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, normalizeSheetName(filenameHint || reportType));
  XLSX.writeFile(workbook, `${filenameHint}_${safeFilenamePart(month)}.xlsx`);
}
