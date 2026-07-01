import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://denebpollux-billing-api.denebpollux-billing.workers.dev/api";
const APP_ID = "21gs-food-hotel";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "sales", label: "Sales", icon: "point_of_sale" },
  { id: "purchases", label: "Purchases", icon: "shopping_cart" },
  { id: "expenses", label: "Expenses", icon: "receipt_long" },
  { id: "reports", label: "Reports", icon: "summarize" },
];

const TYPE_LABELS = {
  sale: "Sale",
  purchase: "Purchase",
  expense: "Expense",
};

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  type: "sale",
  category: "Food",
  description: "",
  vendorCustomer: "",
  paymentMode: "Cash",
  amount: "",
  note: "",
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function addRecordMeta(record) {
  return {
    id: record.id || crypto.randomUUID(),
    createdAt: record.createdAt || new Date().toISOString(),
    ...record,
    amount: Number(record.amount) || 0,
  };
}

function fromApiRecord(record) {
  const payload = record.payload || {};
  return addRecordMeta({
    ...payload,
    id: record.id,
    date: record.record_date,
    type: record.record_type,
    category: payload.category || record.category || "",
    description: payload.description || record.title || "",
    vendorCustomer: payload.vendorCustomer || record.party || "",
    paymentMode: payload.paymentMode || record.payment_mode || "Cash",
    amount: record.amount,
    note: payload.note || record.notes || "",
    createdAt: record.created_at,
  });
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Request failed with ${response.status}`);
  return data;
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
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  const filteredRecords = useMemo(() => {
    const sectionType = activeSection === "sales" ? "sale" : activeSection === "purchases" ? "purchase" : activeSection === "expenses" ? "expense" : "";
    const term = query.trim().toLowerCase();
    return records.filter((record) => {
      const sectionMatch = !sectionType || record.type === sectionType;
      const queryMatch = !term || [record.category, record.description, record.vendorCustomer, record.paymentMode, record.note]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return sectionMatch && queryMatch;
    });
  }, [activeSection, query, records]);

  const totals = useMemo(() => {
    const sales = records.filter((record) => record.type === "sale").reduce((sum, record) => sum + record.amount, 0);
    const purchases = records.filter((record) => record.type === "purchase").reduce((sum, record) => sum + record.amount, 0);
    const expenses = records.filter((record) => record.type === "expense").reduce((sum, record) => sum + record.amount, 0);
    return {
      sales,
      purchases,
      expenses,
      profit: sales - purchases - expenses,
    };
  }, [records]);

  const categoryTotals = useMemo(() => {
    const grouped = records.reduce((map, record) => {
      const key = `${TYPE_LABELS[record.type]} / ${record.category}`;
      map.set(key, (map.get(key) || 0) + record.amount);
      return map;
    }, new Map());
    return Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [records]);

  async function loadRecords() {
    setLoading(true);
    setError("");
    try {
      const data = await api(`/apps/${APP_ID}/records`);
      setRecords((data.records || []).map(fromApiRecord));
    } catch (err) {
      setError(err.message || "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitRecord(event) {
    event.preventDefault();
    setError("");
    try {
      const saved = await api(`/apps/${APP_ID}/records`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          record_type: form.type,
          record_date: form.date,
          title: form.description,
          party: form.vendorCustomer,
          payment_mode: form.paymentMode,
          notes: form.note,
        }),
      });
      setRecords((current) => [fromApiRecord(saved), ...current]);
      setForm({ ...EMPTY_FORM, type: form.type, date: form.date });
    } catch (err) {
      setError(err.message || "Unable to save record.");
    }
  }

  async function deleteRecord(id) {
    setError("");
    try {
      await api(`/apps/${APP_ID}/records/${encodeURIComponent(id)}`, { method: "DELETE" });
      setRecords((current) => current.filter((record) => record.id !== id));
    } catch (err) {
      setError(err.message || "Unable to delete record.");
    }
  }

  function exportCsv() {
    const header = ["Date", "Type", "Category", "Description", "Vendor/Customer", "Payment Mode", "Amount", "Note"];
    const csv = [header, ...records.map((record) => [
      record.date,
      TYPE_LABELS[record.type],
      record.category,
      record.description,
      record.vendorCustomer,
      record.paymentMode,
      record.amount,
      record.note,
    ])].map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "21gs-food-hotel-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderDashboard() {
    return (
      <>
        <section className="summary-grid">
          <MetricCard label="Total Sales" value={currency(totals.sales)} sublabel="Restaurant and room dining" />
          <MetricCard label="Purchases" value={currency(totals.purchases)} sublabel="Food stock and suppliers" />
          <MetricCard label="Expenses" value={currency(totals.expenses)} sublabel="Hotel operating costs" />
          <MetricCard label="Net Profit" value={currency(totals.profit)} sublabel="Sales minus purchase and expense" />
        </section>

        <section className="dashboard-grid">
          <RecordForm
            form={form}
            setField={setField}
            onSubmit={submitRecord}
          />
          <section className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Reports</span>
                <h2>Top categories</h2>
              </div>
            </div>
            <div className="category-list">
              {categoryTotals.map(([label, amount]) => (
                <div className="category-row" key={label}>
                  <span>{label}</span>
                  <strong>{currency(amount)}</strong>
                </div>
              ))}
            </div>
          </section>
        </section>

        <RecordTable records={records.slice(0, 8)} onDelete={deleteRecord} />
      </>
    );
  }

  function renderRecordsPage(type) {
    return (
      <>
        <RecordForm
          form={{ ...form, type }}
          setField={(field, value) => {
            if (field === "type") setField(field, value);
            else setField(field, value);
          }}
          onSubmit={submitRecord}
        />
        <RecordTools query={query} setQuery={setQuery} />
        <RecordTable records={filteredRecords} onDelete={deleteRecord} />
      </>
    );
  }

  function renderReports() {
    return (
      <>
        <section className="summary-grid">
          <MetricCard label="Sales" value={currency(totals.sales)} />
          <MetricCard label="Purchases" value={currency(totals.purchases)} />
          <MetricCard label="Expenses" value={currency(totals.expenses)} />
          <MetricCard label="Profit" value={currency(totals.profit)} />
        </section>
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Financial Summary</span>
              <h2>Category breakup</h2>
            </div>
          </div>
          <div className="category-list report-list">
            {categoryTotals.map(([label, amount]) => (
              <div className="category-row" key={label}>
                <span>{label}</span>
                <strong>{currency(amount)}</strong>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderSection() {
    if (activeSection === "dashboard") return renderDashboard();
    if (activeSection === "sales") return renderRecordsPage("sale");
    if (activeSection === "purchases") return renderRecordsPage("purchase");
    if (activeSection === "expenses") return renderRecordsPage("expense");
    return renderReports();
  }

  return (
    <main className="portal-shell">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="sidebar-menu-button" type="button" onClick={() => setSidebarCollapsed((current) => !current)} title="Toggle sidebar">
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </button>
          <div className="sidebar-identity">
            <div className="sidebar-avatar">21</div>
            <div className="sidebar-company">21GS Food Hotel</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Food hotel records navigation">
          <div className="sidebar-section-label">Records</div>
          {NAV_ITEMS.map((item) => (
            <button
              className={`sidebar-link ${activeSection === item.id ? "active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === "sales") setForm((current) => ({ ...current, type: "sale" }));
                if (item.id === "purchases") setForm((current) => ({ ...current, type: "purchase" }));
                if (item.id === "expenses") setForm((current) => ({ ...current, type: "expense" }));
              }}
              title={item.label}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="material-symbols-outlined" aria-hidden="true">restaurant</span>
            <span>Food Hotel Desk</span>
          </div>
        </div>
      </aside>

      <section className="workspace-shell">
        <header className="navbar">
          <div className="navbar-left">
            <div className="navbar-brand">
              <span className="brand-name">{activeNavItem.label}</span>
              <span className="brand-sub">21GS Food Hotel Records</span>
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

function RecordForm({ form, setField, onSubmit }) {
  return (
    <form className="panel record-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">New Entry</span>
          <h2>Sale, purchase, or expense</h2>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Date
          <input type="date" value={form.date} onChange={(event) => setField("date", event.target.value)} required />
        </label>
        <label>
          Type
          <select value={form.type} onChange={(event) => setField("type", event.target.value)}>
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          Category
          <input value={form.category} onChange={(event) => setField("category", event.target.value)} placeholder="Food, Dairy, Utilities" required />
        </label>
        <label>
          Vendor / Customer
          <input value={form.vendorCustomer} onChange={(event) => setField("vendorCustomer", event.target.value)} placeholder="Supplier or guest" />
        </label>
        <label>
          Description
          <input value={form.description} onChange={(event) => setField("description", event.target.value)} required />
        </label>
        <label>
          Payment Mode
          <select value={form.paymentMode} onChange={(event) => setField("paymentMode", event.target.value)}>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank Transfer</option>
            <option>Credit</option>
          </select>
        </label>
        <label>
          Amount
          <input type="number" min="0" value={form.amount} onChange={(event) => setField("amount", event.target.value)} required />
        </label>
        <label>
          Note
          <input value={form.note} onChange={(event) => setField("note", event.target.value)} />
        </label>
      </div>

      <button className="primary-button" type="submit">Save record</button>
    </form>
  );
}

function RecordTools({ query, setQuery }) {
  return (
    <section className="tools-panel">
      <label className="search">
        <span className="material-symbols-outlined" aria-hidden="true">search</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search category, vendor, description" />
      </label>
    </section>
  );
}

function RecordTable({ records, onDelete }) {
  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Ledger</span>
          <h2>{records.length} records</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Vendor / Customer</th>
              <th>Mode</th>
              <th>Amount</th>
              <th aria-label="Action"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.date).toLocaleDateString("en-IN")}</td>
                <td><span className={`type-badge type-${record.type}`}>{TYPE_LABELS[record.type]}</span></td>
                <td>{record.category}</td>
                <td>{record.description}</td>
                <td>{record.vendorCustomer || "-"}</td>
                <td>{record.paymentMode}</td>
                <td>{currency(record.amount)}</td>
                <td>
                  <button className="row-button" type="button" onClick={() => onDelete(record.id)} title="Delete record">
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td className="empty-cell" colSpan="8">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
