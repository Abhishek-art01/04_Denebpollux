import client, { clientPath } from "./client.js";
import { getStoredClientId } from "../utils/sessionStorage.js";

export async function fetchManualInput(month) {
  const { data } = await client.get(clientPath(`/manual-inputs/${encodeURIComponent(month)}`));
  return data;
}

export async function setManualInput(month, firstValue, secondValue) {
  const payload =
    getStoredClientId() === "airindia"
      ? {
          employee_penalty_t3: firstValue,
          employee_penalty_aiaa: secondValue,
        }
      : {
          amount_recovered_from_employees: firstValue,
        };

  const { data } = await client.post(clientPath(`/manual-inputs/${encodeURIComponent(month)}`), payload);
  return data;
}

export async function fetchExpenses(month) {
  const { data } = await client.get(clientPath(`/expenses/${encodeURIComponent(month)}`));
  return data;
}

export async function setExpenses(month, expensePayload) {
  const { data } = await client.post(clientPath(`/expenses/${encodeURIComponent(month)}`), expensePayload);
  return data;
}
