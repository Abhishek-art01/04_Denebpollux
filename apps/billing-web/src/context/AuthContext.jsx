import React, { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_CLIENT_ID } from "../config/clients.js";
import {
  CLIENT_KEY,
  TOKEN_KEY,
  USER_KEY,
  readJson,
} from "../utils/sessionStorage.js";

const AuthContext = createContext(null);
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function signInWithSupabase(email, password) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase environment is not configured.");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.msg || "Invalid email or password.");
  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => readJson(USER_KEY));
  const [selectedClient, setSelectedClientState] = useState(
    () => window.localStorage.getItem(CLIENT_KEY) || DEFAULT_CLIENT_ID
  );

  async function login(email, password) {
    const session = await signInWithSupabase(email, password);
    window.localStorage.setItem(TOKEN_KEY, session.access_token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    setToken(session.access_token);
    setUser(session.user);
    return session;
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  }

  function setSelectedClient(clientId) {
    window.localStorage.setItem(CLIENT_KEY, clientId);
    setSelectedClientState(clientId);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      selectedClient,
      setSelectedClient,
      login,
      logout,
    }),
    [token, user, selectedClient]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
