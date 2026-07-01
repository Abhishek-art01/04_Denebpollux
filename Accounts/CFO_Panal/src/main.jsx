import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "approvals", label: "Approvals", icon: "approval" },
  { id: "cashflow", label: "Cash Flow", icon: "payments" },
  { id: "budgets", label: "Budgets", icon: "account_balance" },
  { id: "clients", label: "Clients", icon: "business_center" },
  { id: "vendors", label: "Vendors", icon: "groups" },
  { id: "reports", label: "Reports", icon: "summarize" },
];

const APPROVALS = [
  { id: "AP-1048", title: "Agilent vendor payout batch", owner: "Accounts", amount: 284500, status: "Pending", age: "2h" },
  { id: "AP-1047", title: "Air India toll reimbursement", owner: "Operations", amount: 76320, status: "Review", age: "5h" },
  { id: "AP-1046", title: "Fleet maintenance advance", owner: "Fleet", amount: 120000, status: "Pending", age: "1d" },
  { id: "AP-1045", title: "Technology subscription renewal", owner: "Admin", amount: 48500, status: "Approved", age: "1d" },
];

const CLIENTS = [
  { name: "Agilent", receivable: 1284000, payable: 462000, margin: 36, status: "On Track" },
  { name: "Air India", receivable: 2460000, payable: 936000, margin: 31, status: "Reconcile" },
  { name: "Tata", receivable: 820000, payable: 312000, margin: 28, status: "On Track" },
  { name: "Others", receivable: 540000, payable: 185000, margin: 22, status: "Watch" },
];

const CASHFLOW = [
  { label: "Opening Balance", value: 3240000 },
  { label: "Expected Inflow", value: 5180000 },
  { label: "Scheduled Outflow", value: -2720000 },
  { label: "Projected Closing", value: 5700000 },
];

const BUDGETS = [
  { department: "Fleet Operations", allocated: 1800000, used: 1215000 },
  { department: "Vendor Payments", allocated: 2400000, used: 1684000 },
  { department: "Compliance", allocated: 650000, used: 318000 },
  { department: "Administration", allocated: 420000, used: 294000 },
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
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

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  const totalReceivable = CLIENTS.reduce((total, client) => total + client.receivable, 0);
  const totalPayable = CLIENTS.reduce((total, client) => total + client.payable, 0);
  const pendingApprovalValue = APPROVALS
    .filter((item) => item.status !== "Approved")
    .reduce((total, item) => total + item.amount, 0);

  const filteredApprovals = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return APPROVALS;
    return APPROVALS.filter((item) => (
      [item.id, item.title, item.owner, item.status].some((value) => value.toLowerCase().includes(term))
    ));
  }, [query]);

  function exportCsv() {
    const header = ["Type", "Name", "Receivable", "Payable", "Margin", "Status"];
    const rows = CLIENTS.map((client) => ["Client", client.name, client.receivable, client.payable, `${client.margin}%`, client.status]);
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
          <MetricCard label="Pending Approval" value={currency(pendingApprovalValue)} sublabel="3 open requests" />
          <MetricCard label="Projected Cash" value={currency(CASHFLOW[3].value)} sublabel="After scheduled outflow" />
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
              {CASHFLOW.map((item) => (
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
              {APPROVALS.slice(0, 3).map((item) => (
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
          {CASHFLOW.map((item) => (
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
          {BUDGETS.map((budget) => {
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
          {CLIENTS.map((client) => (
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
          {renderSection()}
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
