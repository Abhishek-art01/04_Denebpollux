import React, { createContext, useContext, useMemo, useState } from "react";
import { login as loginRequest } from "../api/auth.js";
import { DEFAULT_CLIENT_ID } from "../config/clients.js";
import {
  CLIENT_KEY,
  TOKEN_KEY,
  USER_KEY,
  readJson,
} from "../utils/sessionStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => readJson(USER_KEY));
  const [selectedClient, setSelectedClientState] = useState(
    () => window.localStorage.getItem(CLIENT_KEY) || DEFAULT_CLIENT_ID
  );

  async function login(username, password) {
    const session = await loginRequest(username, password);
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
