import React from "react";
import { NavLink } from "react-router-dom";
import MonthSelector from "./MonthSelector.jsx";
import DashboardSelector from "./DashboardSelector.jsx";
import ClientSelector from "./ClientSelector.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getClientConfig } from "../../config/clients.js";

export default function Navbar() {
  const { selectedClient, logout, user } = useAuth();
  const clientConfig = getClientConfig(selectedClient);

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">{clientConfig.name}</span>
        <span className="brand-sub">{clientConfig.subtitle}</span>
      </div>

      <div className="navbar-controls">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Upload Data
        </NavLink>
        <ClientSelector />
        <DashboardSelector />
        <MonthSelector />
        <span className="session-user">{user?.name || user?.username}</span>
        <button className="btn-ghost" type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
