import client, { API_BASE_URL, clientPath } from "./client.js";

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

export async function triggerDownload(reportType, month, filenameHint) {
  const response = await client.get(clientPath(`/export/${reportType}`), {
    params: { month },
    responseType: "blob",
  });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameHint}_${month}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
