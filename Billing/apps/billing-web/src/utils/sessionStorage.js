import { DEFAULT_CLIENT_ID } from "../config/clients.js";

export const TOKEN_KEY = "billing.auth.token";
export const USER_KEY = "billing.auth.user";
export const CLIENT_KEY = "billing.selectedClient";

export function readJson(key) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function getStoredAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function getStoredClientId() {
  return window.localStorage.getItem(CLIENT_KEY) || DEFAULT_CLIENT_ID;
}
