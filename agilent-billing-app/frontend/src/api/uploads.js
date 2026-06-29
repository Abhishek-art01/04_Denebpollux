import client from "./client.js";

const UPLOAD_ENDPOINTS = {
  tripData: "/upload/trip-data",
  childCab: "/upload/child-cab",
  backupCab: "/upload/backup-cab",
  maintenanceSecurity: "/upload/maintenance-security",
  spotRental: "/upload/spot-rental",
  additionalCharges: "/upload/additional-charges",
};

export async function uploadSheet(sheetKey, file) {
  const endpoint = UPLOAD_ENDPOINTS[sheetKey];
  if (!endpoint) throw new Error(`Unknown sheet type: ${sheetKey}`);

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await client.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
