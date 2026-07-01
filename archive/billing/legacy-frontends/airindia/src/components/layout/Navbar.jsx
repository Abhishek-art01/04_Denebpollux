import React from "react";
import { NavLink } from "react-router-dom";
import MonthSelector from "./MonthSelector.jsx";
import DashboardSelector from "./DashboardSelector.jsx";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">Air India</span>
        <span className="brand-sub">Billing Dashboard</span>
      </div>

      <div className="navbar-controls">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Upload Data
        </NavLink>
        <DashboardSelector />
        <MonthSelector />
      </div>
    </header>
  );
}
