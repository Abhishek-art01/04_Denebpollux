import React from "react";
import { NavLink } from "react-router-dom";
import MonthSelector from "./MonthSelector.jsx";
import DashboardSelector from "./DashboardSelector.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getClientConfig } from "../../config/clients.js";

export default function Navbar() {
  const { selectedClient } = useAuth();
  const clientConfig = getClientConfig(selectedClient);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <span className="brand-name">{clientConfig.name}</span>
          <span className="brand-sub">{clientConfig.subtitle}</span>
        </div>
        <nav className="navbar-actions" aria-label="Workspace navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <div className="nav-dropdown">
            <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Upload Data
              <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
            </NavLink>
            <div className="nav-dropdown-menu">
              <NavLink to="/upload">Manual Upload</NavLink>
              <span>Cloud Sync</span>
              <span>Upload History</span>
            </div>
          </div>
        </nav>
      </div>

      <div className="navbar-controls">
        <DashboardSelector />
        <MonthSelector />
      </div>
    </header>
  );
}
