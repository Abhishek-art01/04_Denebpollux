import client from "./client.js";
import { wakeAuth } from "./wake.js";

export async function login(username, password) {
  try {
    await wakeAuth();
  } catch (error) {
    console.warn("Auth service wake request did not complete before login", error);
  }

  const { data } = await client.post("/auth/login", { username, password }, { wakeRetry: true });
  return data;
}

export async function fetchSession() {
  const { data } = await client.get("/auth/me");
  return data;
}
