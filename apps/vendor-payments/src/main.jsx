import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://denebpollux-billing-api.denebpollux-billing.workers.dev/api";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const APP_ID = "vendor-payments";
const AUTH_TOKEN_KEY = `${APP_ID}.supabase.access_token`;
const AUTH_USER_KEY = `${APP_ID}.supabase.user`;

const RATE_RULES = [
  { id: "agilent-ertiga-green", client: "Agilent", model: "Ertiga", zone: "Green Zone", range: "Standard", rate: 984 },
  { id: "agilent-ertiga-yellow", client: "Agilent", model: "Ertiga", zone: "Yellow Zone", range: "Standard", rate: 783 },
  { id: "agilent-ertiga-red-far", client: "Agilent", model: "Ertiga", zone: "Red Zone", range: "Far Range", rate: 845 },
  { id: "agilent-ertiga-red-near", client: "Agilent", model: "Ertiga", zone: "Red Zone", range: "Near Range", rate: 654 },
];

const EMPTY_ENTRY = {
  vendor: "",
  vehicleNumber: "",
  ruleId: RATE_RULES[0].id,
  quantity: 1,
  deduction: 0,
  note: "",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "agilent", label: "Agilent", icon: "science" },
  { id: "airindia", label: "Air India", icon: "flight" },
  { id: "tata", label: "Tata", icon: "business_center" },
  { id: "others", label: "Other Vendors", icon: "groups" },
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getRule(ruleId) {
  return RATE_RULES.find((rule) => rule.id === ruleId) || RATE_RULES[0];
}

function fromApiRecord(record) {
  const payload = record.payload || {};
  return {
    ...payload,
    id: record.id,
    vendor: payload.vendor || record.party || "",
    vehicleNumber: payload.vehicleNumber || record.reference || "",
    ruleId: payload.ruleId || RATE_RULES[0].id,
    quantity: Number(record.quantity || payload.quantity || 0),
    deduction: Number(record.deduction || payload.deduction || 0),
    note: payload.note || record.notes || "",
    createdAt: record.created_at,
  };
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
          <h1>Vendor Payments</h1>
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

function calculate(entry) {
  const rule = getRule(entry.ruleId);
  const quantity = Number(entry.quantity) || 0;
  const deduction = Number(entry.deduction) || 0;
  const gross = rule.rate * quantity;
  return {
    rule,
    gross,
    net: Math.max(gross - deduction, 0),
  };
}

function EmptyClientView({ label }) {
  return (
    <section className="placeholder-panel">
      <span className="material-symbols-outlined" aria-hidden="true">pending_actions</span>
      <div>
        <span className="eyebrow">Vendor Payments</span>
        <h2>{label}</h2>
        <p>Payment rules for this client can be added here.</p>
      </div>
    </section>
  );
}

function App() {
  const [entry, setEntry] = useState(EMPTY_ENTRY);
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeTotal = calculate(entry);

  const filteredEntries = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((item) => {
      const { rule } = calculate(item);
      return [item.vendor, item.vehicleNumber, rule.client, rule.model, rule.zone, rule.range, item.note]
        .some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [entries, query]);

  const monthTotal = useMemo(() => (
    filteredEntries.reduce((total, item) => total + calculate(item).net, 0)
  ), [filteredEntries]);

  function setField(field, value) {
    setEntry((current) => ({ ...current, [field]: value }));
  }

  async function loadEntries() {
    setLoading(true);
    setError("");
    try {
      const data = await api(`/apps/${APP_ID}/records`);
      setEntries((data.records || []).map(fromApiRecord));
    } catch (err) {
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function submitEntry(event) {
    event.preventDefault();
    const trimmedVendor = entry.vendor.trim();
    const trimmedVehicle = entry.vehicleNumber.trim();
    if (!trimmedVendor || !trimmedVehicle) return;

    const nextEntry = {
      ...entry,
      vendor: trimmedVendor,
      vehicleNumber: trimmedVehicle.toUpperCase(),
      quantity: Number(entry.quantity) || 0,
      deduction: Number(entry.deduction) || 0,
    };
    const totals = calculate(nextEntry);
    setError("");
    try {
      const saved = await api(`/apps/${APP_ID}/records`, {
        method: "POST",
        body: JSON.stringify({
          ...nextEntry,
          record_type: "vendor-payment",
          record_date: new Date().toISOString().slice(0, 10),
          title: `${totals.rule.client} ${totals.rule.model}`,
          party: nextEntry.vendor,
          category: `${totals.rule.zone} / ${totals.rule.range}`,
          quantity: nextEntry.quantity,
          rate: totals.rule.rate,
          amount: totals.gross,
          deduction: nextEntry.deduction,
          reference: nextEntry.vehicleNumber,
          notes: nextEntry.note,
        }),
      });
      setEntries((current) => [fromApiRecord(saved), ...current]);
      setEntry(EMPTY_ENTRY);
    } catch (err) {
      setError(err.message || "Unable to save payment.");
    }
  }

  async function removeEntry(id) {
    setError("");
    try {
      await api(`/apps/${APP_ID}/records/${encodeURIComponent(id)}`, { method: "DELETE" });
      setEntries((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Unable to delete payment.");
    }
  }

  function exportCsv() {
    const header = ["Date", "Vendor", "Vehicle", "Client", "Model", "Zone", "Range", "Rate", "Quantity", "Gross", "Deduction", "Net", "Note"];
    const rows = entries.map((item) => {
      const totals = calculate(item);
      return [
        new Date(item.createdAt).toLocaleDateString("en-IN"),
        item.vendor,
        item.vehicleNumber,
        totals.rule.client,
        totals.rule.model,
        totals.rule.zone,
        totals.rule.range,
        totals.rule.rate,
        item.quantity,
        totals.gross,
        item.deduction,
        totals.net,
        item.note,
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vendor-payments.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];
  const dashboardTotal = entries.reduce((total, item) => total + calculate(item).net, 0);

  function renderDashboard() {
    return (
      <>
        <section className="summary-grid" aria-label="Payment summary">
          <div className="metric">
            <span>Total Payable</span>
            <strong>{currency(dashboardTotal)}</strong>
          </div>
          <div className="metric">
            <span>Saved Payments</span>
            <strong>{entries.length}</strong>
          </div>
          <div className="metric">
            <span>Active Client</span>
            <strong>Agilent</strong>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Clients</span>
                <h2>Payment sections</h2>
              </div>
            </div>
            <div className="client-list">
              {NAV_ITEMS.slice(1).map((item) => (
                <button className="client-card" type="button" key={item.id} onClick={() => setActiveSection(item.id)}>
                  <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.id === "agilent" ? "Ertiga rules active" : "Rules pending"}</small>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="dashboard-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Agilent</span>
                <h2>Current rules</h2>
              </div>
            </div>
            <div className="rule-list compact">
              {RATE_RULES.map((rule) => (
                <article className="rule-card" key={rule.id}>
                  <div>
                    <strong>{rule.zone}</strong>
                    <span>{rule.range}</span>
                  </div>
                  <b>{currency(rule.rate)}</b>
                </article>
              ))}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderAgilent() {
    return (
      <>
        <section className="summary-grid" aria-label="Payment summary">
          <div className="metric">
            <span>Current Entry</span>
            <strong>{currency(activeTotal.net)}</strong>
          </div>
          <div className="metric">
            <span>Saved Payments</span>
            <strong>{entries.length}</strong>
          </div>
          <div className="metric">
            <span>Filtered Total</span>
            <strong>{currency(monthTotal)}</strong>
          </div>
        </section>

        <section className="content-grid">
          <form className="payment-form" onSubmit={submitEntry}>
            <div className="section-heading">
              <div>
                <span className="eyebrow">New Payment</span>
                <h2>Agilent Ertiga trip payment</h2>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Vendor Name
                <input value={entry.vendor} onChange={(event) => setField("vendor", event.target.value)} required />
              </label>
              <label>
                Vehicle Number
                <input value={entry.vehicleNumber} onChange={(event) => setField("vehicleNumber", event.target.value)} required />
              </label>
              <label>
                Rate Rule
                <select value={entry.ruleId} onChange={(event) => setField("ruleId", event.target.value)}>
                  {RATE_RULES.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.model} - {rule.zone} - {rule.range} - {currency(rule.rate)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Trips / Units
                <input min="0" type="number" value={entry.quantity} onChange={(event) => setField("quantity", event.target.value)} />
              </label>
              <label>
                Deduction
                <input min="0" type="number" value={entry.deduction} onChange={(event) => setField("deduction", event.target.value)} />
              </label>
              <label>
                Note
                <input value={entry.note} onChange={(event) => setField("note", event.target.value)} />
              </label>
            </div>

            <div className="calculation-strip">
              <div>
                <span>Rate</span>
                <strong>{currency(activeTotal.rule.rate)}</strong>
              </div>
              <div>
                <span>Gross</span>
                <strong>{currency(activeTotal.gross)}</strong>
              </div>
              <div>
                <span>Net Payable</span>
                <strong>{currency(activeTotal.net)}</strong>
              </div>
            </div>

            <button className="primary-button" type="submit">Save payment</button>
          </form>

          <section className="rules-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Agilent Rules</span>
                <h2>Ertiga rates</h2>
              </div>
            </div>
            <div className="rule-list">
              {RATE_RULES.map((rule) => (
                <article className="rule-card" key={rule.id}>
                  <div>
                    <strong>{rule.zone}</strong>
                    <span>{rule.range}</span>
                  </div>
                  <b>{currency(rule.rate)}</b>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="register">
          <div className="register-header">
            <div>
              <span className="eyebrow">Saved</span>
              <h2>Payment entries</h2>
            </div>
            <label className="search">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vendor, vehicle, zone" />
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Vehicle</th>
                  <th>Zone</th>
                  <th>Rate</th>
                  <th>Units</th>
                  <th>Net</th>
                  <th aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((item) => {
                  const totals = calculate(item);
                  return (
                    <tr key={item.id}>
                      <td>{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>{item.vendor}</td>
                      <td>{item.vehicleNumber}</td>
                      <td>{totals.rule.zone} / {totals.rule.range}</td>
                      <td>{currency(totals.rule.rate)}</td>
                      <td>{item.quantity}</td>
                      <td>{currency(totals.net)}</td>
                      <td>
                        <button className="row-button" type="button" onClick={() => removeEntry(item.id)} title="Delete payment">
                          <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!filteredEntries.length && (
                  <tr>
                    <td className="empty-cell" colSpan="8">No payment entries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  return (
    <main className="portal-shell">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="sidebar-menu-button" type="button" onClick={() => setSidebarCollapsed((current) => !current)} title="Toggle sidebar">
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>
          <div className="sidebar-identity">
            <div className="sidebar-avatar">VP</div>
            <div className="sidebar-company">Vendor Payments</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Vendor payment navigation">
          <div className="sidebar-section-label">Accounts</div>
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
            <span>Accounts Desk</span>
          </div>
        </div>
      </aside>

      <section className="workspace-shell">
        <header className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand">
              <span className="brand-name">{activeNavItem.label}</span>
              <span className="brand-sub">Vendor Payments</span>
            </div>
          </div>
          <div className="navbar-controls">
            <button className="download-button" type="button" onClick={exportCsv} disabled={!entries.length}>
              <span className="material-symbols-outlined" aria-hidden="true">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        <section className="main-content">
          {error && <div className="form-error">{error}</div>}
          {loading && <div className="form-error">Loading payments...</div>}
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "agilent" && renderAgilent()}
          {activeSection === "airindia" && <EmptyClientView label="Air India" />}
          {activeSection === "tata" && <EmptyClientView label="Tata" />}
          {activeSection === "others" && <EmptyClientView label="Other Vendors" />}
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
