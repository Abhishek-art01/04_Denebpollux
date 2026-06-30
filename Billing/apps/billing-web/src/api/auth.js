import client from "./client.js";

export async function login(username, password) {
  const { data } = await client.post("/auth/login", { username, password }, { wakeRetry: true });
  return data;
}

export async function fetchSession() {
  const { data } = await client.get("/auth/me");
  return data;
}
