import axios from "axios";
import {
  TOKEN_KEY,
  USER_KEY,
  getStoredAuthToken,
  getStoredClientId,
} from "../utils/sessionStorage.js";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const WAKE_RETRY_DELAYS_MS = [4000, 8000, 12000, 16000];

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function canRetryForWake(error) {
  const config = error.config || {};
  const method = (config.method || "get").toLowerCase();
  const isSafeMethod = ["get", "head", "options"].includes(method);
  const retryEnabled = isSafeMethod || config.wakeRetry === true;

  if (!retryEnabled || config.wakeRetry === false) return false;

  const status = error.response?.status;
  const isUnavailableStatus = [408, 425, 502, 503, 504].includes(status);
  const isNetworkOrTimeout = !error.response || error.code === "ECONNABORTED";
  return isUnavailableStatus || isNetworkOrTimeout;
}

client.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    if (canRetryForWake(error)) {
      config.wakeRetryCount = config.wakeRetryCount || 0;
      const delay = WAKE_RETRY_DELAYS_MS[config.wakeRetryCount];
      if (delay) {
        config.wakeRetryCount += 1;
        await sleep(delay);
        return client(config);
      }
    }

    if (error.response?.status === 401) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function clientPath(path) {
  return `/clients/${getStoredClientId()}${path}`;
}

export default client;
