import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://denebpollux-billing-api.denebpollux-billing.workers.dev/api";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const APP_ID = "accounts-management";
const AUTH_TOKEN_KEY = `${APP_ID}.supabase.access_token`;
const AUTH_USER_KEY = `${APP_ID}.supabase.user`;

const RATE_RULES = [
  { client: "Agilent", model: "Ertiga", zone: "Green Zone", range: "Standard", rate: 984 },
  { client: "Agilent", model: "Ertiga", zone: "Yellow Zone", range: "Standard", rate: 783 },
  { client: "Agilent", model: "Ertiga", zone: "Red Zone", range: "Far Range", rate: 845 },
  { client: "Agilent", model: "Ertiga", zone: "Red Zone", range: "Near Range", rate: 654 },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "mis", label: "MIS Upload", icon: "upload_file" },
  { id: "vendor", label: "Vendor Portal", icon: "fact_check" },
  { id: "cfo", label: "CFO Approval", icon: "approval" },
  { id: "accounts", label: "Accounts", icon: "payments" },
  { id: "payments", label: "Payments", icon: "receipt_long" },
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function findRate(row) {
  return RATE_RULES.find((rule) => (
    rule.client.toLowerCase() === String(row.client).toLowerCase()
    && rule.model.toLowerCase() === String(row.model).toLowerCase()
    && rule.zone.toLowerCase() === String(row.zone).toLowerCase()
    && rule.range.toLowerCase() === String(row.range).toLowerCase()
  ));
}

function enrichRow(row, index = crypto.randomUUID()) {
  const rule = findRate(row);
  const trips = Number(row.trips) || 0;
  const rate = rule?.rate || 0;
  return {
    id: row.id || `MIS-${index}`,
    client: row.client || "Agilent",
    vendor: row.vendor || "",
    vehicle: String(row.vehicle || "").toUpperCase(),
    model: row.model || "Ertiga",
    zone: row.zone || "",
    range: row.range || "Standard",
    trips,
    rate,
    gross: trips * rate,
    deduction: Number(row.deduction) || 0,
    status: row.status || "MIS Calculated",
    uploadedAt: row.uploadedAt || new Date().toISOString(),
    paymentRef: row.paymentRef || "",
  };
}

function fromApiRecord(record) {
  const payload = record.payload || {};
  return enrichRow({
    ...payload,
    id: record.id,
    deduction: record.deduction,
    status: record.status,
    paymentRef: record.reference || payload.paymentRef || "",
    uploadedAt: record.created_at,
  });
}

async function api(path, options = {}) {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    window.location.reload();
  }
  if (!response.ok) throw new Error(data.detail || `Request failed with ${response.status}`);
  return data;
}

function readStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

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
  window.localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  return data.user;
}

function LoginGate({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setUser(await signInWithSupabase(email.trim(), password));
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }

  if (!user) {
    return (
      <main className="app-shell">
        <section className="entry-panel">
          <span className="eyebrow">Denebpollux</span>
          <h1>Accounts Management</h1>
          <form className="entry-form" onSubmit={handleSubmit}>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <div className="error-banner">{error}</div>}
            <button className="primary-button" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <>
      {children}
      <button className="auth-sign-out" type="button" onClick={logout}>Sign out</button>
    </>
  );
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] || ""]));
    return enrichRow({
      client: row.client,
      vendor: row.vendor,
      vehicle: row.vehicle || row.vehicle_number,
      model: row.model,
      zone: row.zone,
      range: row.range,
      trips: row.trips || row.units,
    }, index + 1);
  });
}

function StatusBadge({ status }) {
  return <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

function MetricCard({ label, value, sublabel }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {sublabel && <small>{sublabel}</small>}
    </article>
  );
}

function App() {
  const [rows, setRows] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deductions, setDeductions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  const totals = useMemo(() => {
    const gross = rows.reduce((sum, row) => sum + row.gross, 0);
    const deduction = rows.reduce((sum, row) => sum + row.deduction, 0);
    return {
      gross,
      deduction,
      net: gross - deduction,
      vendorPassed: rows.filter((row) => row.status === "Vendor Passed").length,
      cfoApproved: rows.filter((row) => row.status === "CFO Approved").length,
      paid: rows.filter((row) => row.status === "Payment Generated").length,
    };
  }, [rows]);

  async function loadRows() {
    setLoading(true);
    setError("");
    try {
      const data = await api(`/apps/${APP_ID}/records`);
      setRows((data.records || []).map(fromApiRecord));
    } catch (err) {
      setError(err.message || "Unable to load rows.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsedRows = parseCsv(text);
    setError("");
    try {
      const savedRows = await Promise.all(parsedRows.map((row) => saveRow(row)));
      setRows((current) => [...savedRows, ...current]);
    } catch (err) {
      setError(err.message || "Unable to upload MIS.");
    }
    setActiveSection("mis");
  }

  async function saveRow(row) {
    const saved = await api(`/apps/${APP_ID}/records`, {
      method: "POST",
      body: JSON.stringify(toApiPayload(row)),
    });
    return fromApiRecord(saved);
  }

  function toApiPayload(row) {
    return {
      ...row,
      record_type: "mis-payment",
      record_date: new Date().toISOString().slice(0, 10),
      title: `${row.client} ${row.vehicle}`,
      party: row.vendor,
      category: `${row.zone} / ${row.range}`,
      quantity: row.trips,
      rate: row.rate,
      amount: row.gross,
      deduction: row.deduction,
      status: row.status,
      reference: row.paymentRef || row.vehicle,
      notes: row.note || "",
    };
  }

  async function updateRow(id, patch) {
    const current = rows.find((row) => row.id === id);
    if (!current) return;
    setError("");
    try {
      const saved = await api(`/apps/${APP_ID}/records/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(toApiPayload({ ...current, ...patch })),
      });
      const nextRow = fromApiRecord(saved);
      setRows((items) => items.map((row) => row.id === id ? nextRow : row));
    } catch (err) {
      setError(err.message || "Unable to update row.");
    }
  }

  function updateStatus(id, status) {
    updateRow(id, { status });
  }

  function applyDeduction(id) {
    const deduction = Number(deductions[id]) || 0;
    updateRow(id, { deduction, status: "Accounts Ready" });
  }

  function generatePayment(id) {
    const row = rows.find((item) => item.id === id);
    updateRow(id, {
      status: "Payment Generated",
      paymentRef: row?.paymentRef || `PAY-${Date.now().toString().slice(-6)}`,
    });
  }

  function exportCsv() {
    const header = ["Client", "Vendor", "Vehicle", "Model", "Zone", "Range", "Trips", "Rate", "Gross", "Deduction", "Net", "Status", "Payment Ref"];
    const csv = [header, ...rows.map((row) => [
      row.client,
      row.vendor,
      row.vehicle,
      row.model,
      row.zone,
      row.range,
      row.trips,
      row.rate,
      row.gross,
      row.deduction,
      row.gross - row.deduction,
      row.status,
      row.paymentRef,
    ])].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "accounts-management-payments.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderDashboard() {
    return (
      <>
        <section className="summary-grid">
          <MetricCard label="MIS Gross" value={currency(totals.gross)} sublabel={`${rows.length} calculated rows`} />
          <MetricCard label="Vendor Passed" value={totals.vendorPassed} sublabel="Rows passed by vendor team" />
          <MetricCard label="CFO Approved" value={totals.cfoApproved} sublabel="Ready for accounts" />
          <MetricCard label="Payment Net" value={currency(totals.net)} sublabel={`${currency(totals.deduction)} deductions`} />
        </section>

        <section className="workflow-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Workflow</span>
              <h2>MIS to payment generation</h2>
            </div>
          </div>
          <div className="flow-grid">
            {[
              ["MIS Upload", "Upload MIS and auto-calculate vendor gross amounts."],
              ["Vendor Portal", "Vendor team passes verified payment lines."],
              ["CFO Approval", "CFO approves passed vendor payments."],
              ["Accounts", "Accounts adds deductions and generates payments."],
            ].map(([title, text], index) => (
              <article className="flow-card" key={title}>
                <b>{index + 1}</b>
                <strong>{title}</strong>
                <span>{text}</span>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderMisUpload() {
    return (
      <>
        <section className="upload-panel">
          <div>
            <span className="eyebrow">MIS Team</span>
            <h2>Upload MIS and calculate vendor payments</h2>
            <p>CSV columns: client, vendor, vehicle, model, zone, range, trips. Agilent Ertiga rules are applied automatically.</p>
          </div>
          <div className="upload-actions">
            <label className="file-button">
              <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
              Upload CSV
              <input type="file" accept=".csv,text/csv" onChange={handleUpload} />
            </label>
          </div>
        </section>
        {renderTable(rows, "mis")}
      </>
    );
  }

  function renderVendorPortal() {
    return renderTable(rows.filter((row) => row.status === "MIS Calculated"), "vendor");
  }

  function renderCfoApproval() {
    return renderTable(rows.filter((row) => row.status === "Vendor Passed"), "cfo");
  }

  function renderAccounts() {
    return renderTable(rows.filter((row) => row.status === "CFO Approved" || row.status === "Accounts Ready"), "accounts");
  }

  function renderPayments() {
    return renderTable(rows.filter((row) => row.status === "Payment Generated"), "payments");
  }

  function renderTable(tableRows, mode) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{activeNavItem.label}</span>
            <h2>{tableRows.length} payment lines</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Vehicle</th>
                <th>Zone</th>
                <th>Trips</th>
                <th>Gross</th>
                <th>Deduction</th>
                <th>Net</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.vendor}</td>
                  <td>{row.vehicle}</td>
                  <td>{row.zone} / {row.range}</td>
                  <td>{row.trips}</td>
                  <td>{currency(row.gross)}</td>
                  <td>
                    {mode === "accounts" && row.status !== "Payment Generated" ? (
                      <input
                        className="deduction-input"
                        type="number"
                        min="0"
                        value={deductions[row.id] ?? row.deduction}
                        onChange={(event) => setDeductions((current) => ({ ...current, [row.id]: event.target.value }))}
                      />
                    ) : currency(row.deduction)}
                  </td>
                  <td>{currency(row.gross - row.deduction)}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{renderAction(row, mode)}</td>
                </tr>
              ))}
              {!tableRows.length && (
                <tr>
                  <td className="empty-cell" colSpan="9">No rows in this stage.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderAction(row, mode) {
    if (mode === "vendor") {
      return <button className="row-action" type="button" onClick={() => updateStatus(row.id, "Vendor Passed")}>Pass</button>;
    }
    if (mode === "cfo") {
      return <button className="row-action" type="button" onClick={() => updateStatus(row.id, "CFO Approved")}>Approve</button>;
    }
    if (mode === "accounts") {
      return (
        <div className="action-stack">
          <button className="row-action" type="button" onClick={() => applyDeduction(row.id)}>Save Deduction</button>
          <button className="row-action primary" type="button" onClick={() => generatePayment(row.id)}>Generate</button>
        </div>
      );
    }
    if (mode === "payments") return row.paymentRef || "-";
    return "-";
  }

  function renderSection() {
    if (activeSection === "dashboard") return renderDashboard();
    if (activeSection === "mis") return renderMisUpload();
    if (activeSection === "vendor") return renderVendorPortal();
    if (activeSection === "cfo") return renderCfoApproval();
    if (activeSection === "accounts") return renderAccounts();
    return renderPayments();
  }

  return (
    <main className="portal-shell">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="sidebar-menu-button" type="button" onClick={() => setSidebarCollapsed((current) => !current)} title="Toggle sidebar">
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>
          <div className="sidebar-identity">
            <div className="sidebar-avatar">AM</div>
            <div className="sidebar-company">Accounts Management</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Accounts management navigation">
          <div className="sidebar-section-label">Portal</div>
          {NAV_ITEMS.map((item) => (
            <button
              className={`sidebar-link ${activeSection === item.id ? "active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              title={item.label}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
            <span>Accounts Team</span>
          </div>
        </div>
      </aside>

      <section className="workspace-shell">
        <header className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand">
              <span className="brand-name">{activeNavItem.label}</span>
              <span className="brand-sub">Accounts Management</span>
            </div>
          </div>
          <div className="navbar-controls">
            <button className="download-button" type="button" onClick={exportCsv}>
              <span className="material-symbols-outlined" aria-hidden="true">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        <section className="main-content">
          {error && <div className="form-error">{error}</div>}
          {loading && <div className="form-error">Loading records...</div>}
          {renderSection()}
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <LoginGate>
    <App />
  </LoginGate>
);
