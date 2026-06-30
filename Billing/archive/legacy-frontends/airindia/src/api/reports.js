import client from "./client.js";

export async function fetchMonths() {
  const { data } = await client.get("/months");
  return data.months;
}

export async function fetchRevenueSummary(month) {
  const { data } = await client.get("/reports/revenue-summary", { params: { month } });
  return data;
}

export async function fetchVehicleRevenueSummary(month) {
  const { data } = await client.get("/reports/vehicle-revenue-summary", { params: { month } });
  return data;
}

export async function fetchPnlSummary(month) {
  const { data } = await client.get("/reports/pnl-summary", { params: { month } });
  return data;
}

export async function triggerDownload(reportType, month, filenameHint) {
  const response = await client.get(`/export/${reportType}`, {
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
