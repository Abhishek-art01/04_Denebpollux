import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "complience_auth_token";
const USER_KEY = "complience_user";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const EMPTY_FORM = {
  vehicle_number: "",
  ownership: "",
  model: "",
  site: "",
  manager: "",
  client: "",
};

const SECTIONS = [
  { id: "repair", label: "Repair & Maintenance", icon: "build" },
  { id: "fuel", label: "Fuel", icon: "local_gas_station" },
  { id: "vehicles", label: "Vehicle Management", icon: "directions_car" },
];

function normalizeForm(vehicle) {
  return {
    vehicle_number: vehicle.vehicle_number || "",
    ownership: vehicle.ownership || "",
    model: vehicle.model || "",
    site: vehicle.site || "",
    manager: vehicle.manager || "",
    client: vehicle.client || "",
  };
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post("/auth/login", { username: username.trim(), password });
      window.localStorage.setItem(TOKEN_KEY, data.access_token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 401 ? "Invalid username or password." : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div>
          <span className="eyebrow">Deneb & Pollux</span>
          <h1>Vehicle Compliance</h1>
          <p>Sign in to manage the compliance vehicle register.</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

function VehicleForm({ editingVehicle, form, setForm, saving, onSubmit, onCancel, error }) {
  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form className="vehicle-form" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{editingVehicle ? "Edit Vehicle" : "New Vehicle"}</span>
          <h2>{editingVehicle ? editingVehicle.vehicle_number : "Create vehicle record"}</h2>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Vehicle Number
          <input value={form.vehicle_number} onChange={(event) => setField("vehicle_number", event.target.value)} required />
        </label>
        <label>
          Ownership
          <input value={form.ownership} onChange={(event) => setField("ownership", event.target.value)} />
        </label>
        <label>
          Model
          <input value={form.model} onChange={(event) => setField("model", event.target.value)} />
        </label>
        <label>
          Site
          <input value={form.site} onChange={(event) => setField("site", event.target.value)} />
        </label>
        <label>
          Manager
          <input value={form.manager} onChange={(event) => setField("manager", event.target.value)} />
        </label>
        <label>
          Client
          <input value={form.client} onChange={(event) => setField("client", event.target.value)} />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save vehicle"}</button>
        {editingVehicle && <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>}
        {error && <span className="form-error inline">{error}</span>}
      </div>
    </form>
  );
}

function EmptySection({ section }) {
  return (
    <section className="empty-section">
      <span className="material-symbols-outlined" aria-hidden="true">{section.icon}</span>
      <div>
        <span className="eyebrow">Compliance</span>
        <h2>{section.label}</h2>
        <p>This section is ready for the {section.label.toLowerCase()} workflow.</p>
      </div>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("vehicles");

  async function loadVehicles() {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/vehicles");
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) logout();
      else setError(err.response?.data?.detail || "Unable to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadVehicles();
  }, [user]);

  const filteredVehicles = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((vehicle) => (
      [vehicle.vehicle_number, vehicle.ownership, vehicle.model, vehicle.site, vehicle.manager, vehicle.client]
        .some((value) => String(value || "").toLowerCase().includes(term))
    ));
  }, [vehicles, query]);

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
    setVehicles([]);
  }

  function startCreate() {
    setEditingVehicle(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function startEdit(vehicle) {
    setEditingVehicle(vehicle);
    setForm(normalizeForm(vehicle));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingVehicle) {
        await client.patch(`/vehicles/${encodeURIComponent(editingVehicle.id)}`, form);
      } else {
        await client.post("/vehicles", form);
      }
      startCreate();
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
      await client.delete(`/vehicles/${encodeURIComponent(vehicle.id)}`);
      if (editingVehicle?.id === vehicle.id) startCreate();
      await loadVehicles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to delete vehicle.");
    }
  }

  if (!user) return <Login onLogin={setUser} />;

  const activeConfig = SECTIONS.find((section) => section.id === activeSection) || SECTIONS[2];

  return (
    <div className={`portal-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`} aria-label="Compliance navigation">
        <div className="sidebar-header">
          <button
            className="sidebar-menu-button"
            type="button"
            aria-label={sidebarCollapsed ? "Show side panel" : "Hide side panel"}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>
          <div className="sidebar-identity">
            <div className="sidebar-avatar" aria-hidden="true">DP</div>
            <div className="sidebar-company">Deneb&amp;Pollux</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Compliance</div>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`sidebar-link ${activeSection === section.id ? "active" : ""}`}
              type="button"
              onClick={() => setActiveSection(section.id)}
              title={section.label}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{section.icon}</span>
              <span className="sidebar-text">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
            <span className="sidebar-text">{user.name || user.username}</span>
          </div>
          <button className="sidebar-link" type="button" onClick={logout} title="Logout">
            <span className="material-symbols-outlined" aria-hidden="true">logout</span>
            <span className="sidebar-text">Logout</span>
          </button>
        </div>
      </aside>

      <div className="workspace-shell">
        <header className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand">
              <span className="brand-name">Compliance</span>
              <span className="brand-sub">{activeConfig.label}</span>
            </div>
            <nav className="navbar-actions" aria-label="Section navigation">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  className={`nav-link ${activeSection === section.id ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="navbar-controls">
            <div className="user-chip">
              <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
              {user.name || user.username}
            </div>
            <button className="icon-button" type="button" onClick={loadVehicles} title="Refresh vehicles">
              <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
            </button>
          </div>
        </header>

        <main className="main-content">
          {activeSection !== "vehicles" ? (
            <EmptySection section={activeConfig} />
          ) : (
            <>
              <div className="report-header">
                <div className="report-title-block">
                  <div className="eyebrow">Fleet Compliance</div>
                  <h1>Vehicle Management</h1>
                  <div className="report-period">{vehicles.length} vehicles in register</div>
                </div>
              </div>

              <section className="summary-strip">
                <div>
                  <span>Total Vehicles</span>
                  <strong>{vehicles.length}</strong>
                </div>
                <div>
                  <span>Visible Fields</span>
                  <strong>6</strong>
                </div>
                <div>
                  <span>Restricted Fields</span>
                  <strong>2 hidden</strong>
                </div>
              </section>

              <VehicleForm
                editingVehicle={editingVehicle}
                form={form}
                setForm={setForm}
                saving={saving}
                onSubmit={handleSubmit}
                onCancel={startCreate}
                error={error}
              />

              <section className="table-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Register</span>
                    <h2>{loading ? "Loading vehicles" : `${filteredVehicles.length} vehicles`}</h2>
                  </div>
                  <div className="table-actions">
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vehicle, site, manager..." />
                    <button className="primary-button" type="button" onClick={startCreate}>New vehicle</button>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Vehicle Number</th>
                        <th>Ownership</th>
                        <th>Model</th>
                        <th>Site</th>
                        <th>Manager</th>
                        <th>Client</th>
                        <th>Updated</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td className="strong">{vehicle.vehicle_number}</td>
                          <td>{vehicle.ownership}</td>
                          <td>{vehicle.model}</td>
                          <td>{vehicle.site}</td>
                          <td>{vehicle.manager}</td>
                          <td>{vehicle.client}</td>
                          <td>{formatDate(vehicle.updated_at)}</td>
                          <td>
                            <div className="row-actions">
                              <button className="icon-button small" type="button" onClick={() => startEdit(vehicle)} title="Edit">
                                <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                              </button>
                              <button className="icon-button small danger" type="button" onClick={() => handleDelete(vehicle)} title="Delete">
                                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!loading && filteredVehicles.length === 0 && (
                        <tr>
                          <td colSpan="8" className="empty-cell">No vehicles found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
