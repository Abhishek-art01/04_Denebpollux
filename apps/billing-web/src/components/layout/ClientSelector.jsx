import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { CLIENTS } from "../../config/clients.js";

export default function ClientSelector() {
  const { selectedClient, setSelectedClient } = useAuth();

  return (
    <div className="select-control">
      <label htmlFor="client-select">Client</label>
      <select
        id="client-select"
        value={selectedClient}
        onChange={(event) => setSelectedClient(event.target.value)}
      >
        {CLIENTS.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
}
