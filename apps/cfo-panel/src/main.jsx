import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://denebpollux-billing-api.denebpollux-billing.workers.dev/api";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SOURCE_APPS = ["accounts-management", "vendor-payments", "21gs-food-hotel", "pcg-tea-stall", "aravali-dairy"];
const APP_ID = "cfo-panel";
const AUTH_TOKEN_KEY = `${APP_ID}.supabase.access_token`;
const AUTH_USER_KEY = `${APP_ID}.supabase.user`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "approvals", label: "Approvals", icon: "approval" },
  { id: "cashflow", label: "Cash Flow", icon: "payments" },
  { id: "budgets", label: "Budgets", icon: "account_balance" },
  { id: "clients", label: "Clients", icon: "business_center" },
  { id: "vendors", label: "Vendors", icon: "groups" },
  { id: "reports", label: "Reports", icon: "summarize" },
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

async function api(path) {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
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
          <h1>CFO Panel</h1>
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

function appLabel(appId) {
  return {
    "accounts-management": "Accounts Management",
    "vendor-payments": "Vendor Payments",
    "21gs-food-hotel": "21GS Food Hotel",
    "pcg-tea-stall": "PCG Tea Stall",
    "aravali-dairy": "Aravali Dairy",
  }[appId] || appId;
}

function StatusBadge({ status }) {
  return <span className={`status status-${status.toLowerCase().replace(" ", "-")}`}>{status}</span>;
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

function EmptyPanel({ title }) {
  return (
    <section className="placeholder-panel">
      <span className="material-symbols-outlined" aria-hidden="true">construction</span>
      <div>
        <span className="eyebrow">CFO Panel</span>
        <h2>{title}</h2>
        <p>This section is ready for live finance data and workflows.</p>
      </div>
    </section>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  async function loadRecords() {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all(SOURCE_APPS.map(async (appId) => {
        const data = await api(`/apps/${appId}/records`);
        return (data.records || []).map((record) => ({ ...record, app_id: appId }));
      }));
      setRecords(results.flat());
    } catch (err) {
      setError(err.message || "Unable to load CFO data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  const approvals = useMemo(() => records
    .filter((record) => ["Vendor Passed", "Accounts Ready", "draft"].includes(record.status))
    .map((record) => ({
      id: String(record.id).slice(0, 8),
      title: record.title || record.payload?.description || appLabel(record.app_id),
      owner: appLabel(record.app_id),
      amount: Number(record.amount || 0) - Number(record.deduction || 0),
      status: record.status === "Vendor Passed" ? "Pending" : record.status,
      age: record.record_date || "",
    })), [records]);

  const clients = useMemo(() => {
    const grouped = new Map();
    for (const record of records) {
      const payload = record.payload || {};
      const name = payload.client || appLabel(record.app_id);
      const current = grouped.get(name) || { name, receivable: 0, payable: 0, margin: 0, status: "On Track" };
      const amount = Number(record.amount || 0);
      const type = record.record_type || payload.type;
      if (["sale", "income", "revenue"].includes(type)) current.receivable += amount;
      else current.payable += amount;
      grouped.set(name, current);
    }
    return Array.from(grouped.values()).map((client) => ({
      ...client,
      margin: client.receivable ? Math.round(((client.receivable - client.payable) / client.receivable) * 100) : 0,
      status: client.payable > client.receivable ? "Watch" : "On Track",
    }));
  }, [records]);

  const budgets = useMemo(() => SOURCE_APPS.map((appId) => {
    const used = records.filter((record) => record.app_id === appId).reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return { department: appLabel(appId), allocated: Math.max(used * 1.25, 1), used };
  }), [records]);

  const totalReceivable = clients.reduce((total, client) => total + client.receivable, 0);
  const totalPayable = clients.reduce((total, client) => total + client.payable, 0);
  const pendingApprovalValue = approvals
    .filter((item) => item.status !== "Approved")
    .reduce((total, item) => total + item.amount, 0);
  const cashflow = [
    { label: "Opening Balance", value: 0 },
    { label: "Expected Inflow", value: totalReceivable },
    { label: "Scheduled Outflow", value: -totalPayable },
    { label: "Projected Closing", value: totalReceivable - totalPayable },
  ];

  const filteredApprovals = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return approvals;
    return approvals.filter((item) => (
      [item.id, item.title, item.owner, item.status].some((value) => value.toLowerCase().includes(term))
    ));
  }, [approvals, query]);

  function exportCsv() {
    const header = ["Type", "Name", "Receivable", "Payable", "Margin", "Status"];
    const rows = clients.map((client) => ["Client", client.name, client.receivable, client.payable, `${client.margin}%`, client.status]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cfo-panel-summary.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderDashboard() {
    return (
      <>
        <section className="summary-grid" aria-label="CFO summary">
          <MetricCard label="Receivables" value={currency(totalReceivable)} sublabel="Across active clients" />
          <MetricCard label="Payables" value={currency(totalPayable)} sublabel="Vendor and operating dues" />
          <MetricCard label="Pending Approval" value={currency(pendingApprovalValue)} sublabel={`${approvals.length} open requests`} />
          <MetricCard label="Projected Cash" value={currency(cashflow[3].value)} sublabel="After scheduled outflow" />
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Cash Position</span>
                <h2>Current month forecast</h2>
              </div>
            </div>
            <div className="cash-list">
              {cashflow.map((item) => (
                <div className="cash-row" key={item.label}>
                  <span>{item.label}</span>
                  <strong className={item.value < 0 ? "negative" : ""}>{currency(item.value)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Approvals</span>
                <h2>Waiting for CFO</h2>
              </div>
            </div>
            <div className="approval-list compact">
              {approvals.slice(0, 3).map((item) => (
                <article className="approval-card" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.id} / {item.owner}</span>
                  </div>
                  <b>{currency(item.amount)}</b>
                </article>
              ))}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderApprovals() {
    return (
      <section className="panel">
        <div className="register-header">
          <div>
            <span className="eyebrow">Controls</span>
            <h2>Approval queue</h2>
          </div>
          <label className="search">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search request, owner, status" />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>Owner</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.id}</strong>
                    <span>{item.title}</span>
                  </td>
                  <td>{item.owner}</td>
                  <td>{currency(item.amount)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>{item.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderCashflow() {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Treasury</span>
            <h2>Cash flow statement</h2>
          </div>
        </div>
        <div className="cash-grid">
          {cashflow.map((item) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={currency(item.value)}
              sublabel={item.value < 0 ? "Scheduled payment" : "Available forecast"}
            />
          ))}
        </div>
      </section>
    );
  }

  function renderBudgets() {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Budget Control</span>
            <h2>Department usage</h2>
          </div>
        </div>
        <div className="budget-list">
          {budgets.map((budget) => {
            const percent = Math.round((budget.used / budget.allocated) * 100);
            return (
              <article className="budget-card" key={budget.department}>
                <div>
                  <strong>{budget.department}</strong>
                  <span>{currency(budget.used)} used of {currency(budget.allocated)}</span>
                </div>
                <div className="progress" aria-label={`${percent}% used`}>
                  <span style={{ width: `${percent}%` }} />
                </div>
                <b>{percent}%</b>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  function renderClients() {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Client Ledger</span>
            <h2>Receivable and margin view</h2>
          </div>
        </div>
        <div className="client-grid">
          {clients.map((client) => (
            <article className="client-card" key={client.name}>
              <div>
                <strong>{client.name}</strong>
                <StatusBadge status={client.status} />
              </div>
              <dl>
                <div><dt>Receivable</dt><dd>{currency(client.receivable)}</dd></div>
                <div><dt>Payable</dt><dd>{currency(client.payable)}</dd></div>
                <div><dt>Margin</dt><dd>{client.margin}%</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderSection() {
    if (activeSection === "dashboard") return renderDashboard();
    if (activeSection === "approvals") return renderApprovals();
    if (activeSection === "cashflow") return renderCashflow();
    if (activeSection === "budgets") return renderBudgets();
    if (activeSection === "clients") return renderClients();
    if (activeSection === "vendors") return <EmptyPanel title="Vendors" />;
    return <EmptyPanel title="Reports" />;
  }

  return (
    <main className="portal-shell">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="sidebar-menu-button" type="button" onClick={() => setSidebarCollapsed((current) => !current)} title="Toggle sidebar">
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>
          <div className="sidebar-identity">
            <div className="sidebar-avatar">CF</div>
            <div className="sidebar-company">CFO Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="CFO navigation">
          <div className="sidebar-section-label">Finance</div>
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
            <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
            <span>CFO Office</span>
          </div>
        </div>
      </aside>

      <section className="workspace-shell">
        <header className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand">
              <span className="brand-name">{activeNavItem.label}</span>
              <span className="brand-sub">CFO Panel</span>
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
          {loading && <div className="form-error">Loading finance data...</div>}
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
