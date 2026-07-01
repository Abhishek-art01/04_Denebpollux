import client, { clientPath } from "./client.js";
import * as XLSX from "xlsx";

const UPLOAD_ENDPOINTS = {
  tripData: "/upload/trip-data",
  childCab: "/upload/child-cab",
  backupCab: "/upload/backup-cab",
  maintenanceSecurity: "/upload/maintenance-security",
  spotRental: "/upload/spot-rental",
  additionalCharges: "/upload/additional-charges",
  tripDataTerminal3: "/upload/trip-data-terminal3",
  tripDataAIAA: "/upload/trip-data-aiaa",
  sundries: "/upload/sundries",
  penaltyVehicleWise: "/upload/penalty-vehicle-wise",
};

export async function uploadSheet(sheetKey, file) {
  const endpoint = UPLOAD_ENDPOINTS[sheetKey];
  if (!endpoint) throw new Error(`Unknown sheet type: ${sheetKey}`);

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("Uploaded workbook does not contain any sheets");

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    defval: null,
    raw: false,
  });

  const { data } = await client.post(clientPath(endpoint), {
    file_name: file.name,
    sheet_name: firstSheetName,
    rows,
  });
  return data;
}
