import React from "react";
import { CLIENTS } from "../../config/clients.js";
import { useAuth } from "../../context/AuthContext.jsx";

const CLIENT_ICONS = {
  agilent: "business_center",
  airindia: "flight_takeoff",
};

export default function Sidebar() {
  const { selectedClient, setSelectedClient, logout, user } = useAuth();

  return (
    <aside className="sidebar" aria-label="Client navigation">
      <div className="sidebar-header">
        <button className="sidebar-menu-button" type="button" aria-label="Open menu">
          <span className="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>
        <div className="sidebar-identity">
          <div className="sidebar-avatar" aria-hidden="true">
            DP
          </div>
          <div className="sidebar-company">Deneb&amp;Pollux</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Clients</div>
        {CLIENTS.map((client) => {
          const isActive = selectedClient === client.id;
          return (
            <button
              key={client.id}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              type="button"
              onClick={() => setSelectedClient(client.id)}
              title={client.name}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {CLIENT_ICONS[client.id] || "domain"}
              </span>
              <span>{client.name}</span>
            </button>
          );
        })}
        <button className="sidebar-link muted" type="button" disabled title="New Client">
          <span className="material-symbols-outlined" aria-hidden="true">add_circle</span>
          <span>New Client</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
          <span>{user?.name || user?.username}</span>
        </div>
        <button className="sidebar-link" type="button" onClick={logout} title="Logout">
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
