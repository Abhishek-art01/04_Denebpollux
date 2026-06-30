import client from "./client.js";

export async function fetchManualInput(month) {
  const { data } = await client.get(`/manual-inputs/${encodeURIComponent(month)}`);
  return data;
}

export async function setManualInput(month, employeePenaltyT3, employeePenaltyAiaa) {
  const { data } = await client.post(`/manual-inputs/${encodeURIComponent(month)}`, {
    employee_penalty_t3: employeePenaltyT3,
    employee_penalty_aiaa: employeePenaltyAiaa,
  });
  return data;
}

export async function fetchExpenses(month) {
  const { data } = await client.get(`/expenses/${encodeURIComponent(month)}`);
  return data;
}

export async function setExpenses(month, expensePayload) {
  const { data } = await client.post(`/expenses/${encodeURIComponent(month)}`, expensePayload);
  return data;
}
