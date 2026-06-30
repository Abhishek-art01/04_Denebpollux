import axios from "axios";
import { getStoredAuthToken, getStoredClientId } from "../utils/sessionStorage.js";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function clientPath(path) {
  return `/clients/${getStoredClientId()}${path}`;
}

export default client;
