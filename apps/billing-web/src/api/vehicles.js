import client from "./client.js";

export async function fetchVehicles() {
  const { data } = await client.get("/vehicles");
  return data.vehicles || [];
}

export async function createVehicle(vehicle) {
  const { data } = await client.post("/vehicles", vehicle);
  return data;
}

export async function updateVehicle(id, vehicle) {
  const { data } = await client.patch(`/vehicles/${encodeURIComponent(id)}`, vehicle);
  return data;
}

export async function deleteVehicle(id) {
  const { data } = await client.delete(`/vehicles/${encodeURIComponent(id)}`);
  return data;
}
