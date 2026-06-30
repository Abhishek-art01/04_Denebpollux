import client, { clientPath } from "./client.js";

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

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await client.post(clientPath(endpoint), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
