import React, { useEffect, useMemo, useState } from "react";
import DataTable from "../components/shared/DataTable.jsx";
import { createVehicle, deleteVehicle, fetchVehicles, updateVehicle } from "../api/vehicles.js";

const EMPTY_FORM = {
  vehicle_number: "",
  ownership: "",
  model: "",
  site: "",
  manager: "",
  client: "",
};

function toForm(vehicle) {
  return {
    vehicle_number: vehicle.vehicle_number || "",
    ownership: vehicle.ownership || "",
    model: vehicle.model || "",
    site: vehicle.site || "",
    manager: vehicle.manager || "",
    client: vehicle.client || "",
  };
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CompliancePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadVehicles() {
    setLoading(true);
    setError("");
    try {
      setVehicles(await fetchVehicles());
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((vehicle) => (
      [vehicle.vehicle_number, vehicle.ownership, vehicle.model, vehicle.site, vehicle.manager, vehicle.client]
        .some((value) => String(value || "").toLowerCase().includes(term))
    ));
  }, [vehicles, query]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startCreate() {
    setEditingVehicle(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function startEdit(vehicle) {
    setEditingVehicle(vehicle);
    setForm(toForm(vehicle));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, form);
      } else {
        await createVehicle(form);
      }
      setForm(EMPTY_FORM);
      setEditingVehicle(null);
      await loadVehicles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to save vehicle.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(vehicle) {
    if (!window.confirm(`Delete ${vehicle.vehicle_number}?`)) return;
    setError("");
    try {
      await deleteVehicle(vehicle.id);
      if (editingVehicle?.id === vehicle.id) {
        setEditingVehicle(null);
        setForm(EMPTY_FORM);
      }
      await loadVehicles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to delete vehicle.");
    }
  }

  const columns = [
    { key: "vehicle_number", label: "Vehicle Number" },
    { key: "ownership", label: "Ownership" },
    { key: "model", label: "Model" },
    { key: "site", label: "Site" },
    { key: "manager", label: "Manager" },
    { key: "client", label: "Client" },
    { key: "updated_at", label: "Updated", render: (row) => formatDateTime(row.updated_at) },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="row-actions">
          <button className="icon-button small" type="button" onClick={() => startEdit(row)} title="Edit vehicle">
            <span className="material-symbols-outlined" aria-hidden="true">edit</span>
          </button>
          <button className="icon-button small danger" type="button" onClick={() => handleDelete(row)} title="Delete vehicle">
            <span className="material-symbols-outlined" aria-hidden="true">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="compliance-page">
      <div className="report-header">
        <div className="report-title-block">
          <div className="eyebrow">Compliance</div>
          <h1>Vehicle Register</h1>
          <div className="report-period">{vehicles.length} vehicles</div>
        </div>
        <div className="compliance-toolbar">
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search vehicles"
          />
          <button className="btn-primary" type="button" onClick={startCreate}>New vehicle</button>
        </div>
      </div>

      <form className="card vehicle-form" onSubmit={handleSubmit}>
        <h2 className="card-title">{editingVehicle ? `Edit ${editingVehicle.vehicle_number}` : "New Vehicle"}</h2>
        <div className="form-grid vehicle-form-grid">
          <div className="form-field">
            <label htmlFor="vehicle-number">Vehicle Number</label>
            <input id="vehicle-number" value={form.vehicle_number} onChange={(event) => updateField("vehicle_number", event.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="vehicle-ownership">Ownership</label>
            <input id="vehicle-ownership" value={form.ownership} onChange={(event) => updateField("ownership", event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="vehicle-model">Model</label>
            <input id="vehicle-model" value={form.model} onChange={(event) => updateField("model", event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="vehicle-site">Site</label>
            <input id="vehicle-site" value={form.site} onChange={(event) => updateField("site", event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="vehicle-manager">Manager</label>
            <input id="vehicle-manager" value={form.manager} onChange={(event) => updateField("manager", event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="vehicle-client">Client</label>
            <input id="vehicle-client" value={form.client} onChange={(event) => updateField("client", event.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save vehicle"}</button>
          {editingVehicle && <button className="btn-secondary" type="button" onClick={startCreate}>Cancel</button>}
          {error && <span className="form-error-inline">{error}</span>}
        </div>
      </form>

      <div className="card">
        <h2 className="card-title">{loading ? "Loading vehicles" : "Vehicles"}</h2>
        <DataTable columns={columns} rows={loading ? [] : filteredVehicles} />
      </div>
    </div>
  );
}
