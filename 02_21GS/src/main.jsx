import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const STORAGE_KEY = "21gs_food_hotel_records";

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

const SAMPLE_RECORDS = [
  { date: "2026-07-01", type: "sale", category: "Room Dining", description: "Breakfast buffet", vendorCustomer: "Walk-in", paymentMode: "UPI", amount: 8400, note: "Morning service" },
  { date: "2026-07-01", type: "sale", category: "Restaurant", description: "Lunch orders", vendorCustomer: "Corporate guests", paymentMode: "Card", amount: 17600, note: "" },
  { date: "2026-07-01", type: "purchase", category: "Vegetables", description: "Fresh vegetables", vendorCustomer: "Sabzi Mandi Vendor", paymentMode: "Cash", amount: 5200, note: "Kitchen stock" },
  { date: "2026-07-01", type: "purchase", category: "Dairy", description: "Milk, paneer, curd", vendorCustomer: "Dairy Supplier", paymentMode: "UPI", amount: 3850, note: "" },
  { date: "2026-07-01", type: "expense", category: "Utilities", description: "Kitchen gas refill", vendorCustomer: "Gas Agency", paymentMode: "Cash", amount: 2400, note: "" },
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function loadRecords() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") || SAMPLE_RECORDS.map(addRecordMeta);
  } catch {
    return SAMPLE_RECORDS.map(addRecordMeta);
  }
}

function addRecordMeta(record) {
  return {
    id: record.id || crypto.randomUUID(),
    createdAt: record.createdAt || new Date().toISOString(),
    ...record,
    amount: Number(record.amount) || 0,
  };
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
  const [records, setRecords] = useState(loadRecords);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  function saveRecords(nextRecords) {
    setRecords(nextRecords);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  }

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitRecord(event) {
    event.preventDefault();
    const nextRecord = addRecordMeta(form);
    saveRecords([nextRecord, ...records]);
    setForm({ ...EMPTY_FORM, type: form.type, date: form.date });
  }

  function deleteRecord(id) {
    saveRecords(records.filter((record) => record.id !== id));
  }

  function loadSampleData() {
    saveRecords(SAMPLE_RECORDS.map(addRecordMeta));
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
            onLoadSample={loadSampleData}
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
          onLoadSample={loadSampleData}
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
          {renderSection()}
        </section>
      </section>
    </main>
  );
}

function RecordForm({ form, setField, onSubmit, onLoadSample }) {
  return (
    <form className="panel record-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">New Entry</span>
          <h2>Sale, purchase, or expense</h2>
        </div>
        <button className="secondary-button" type="button" onClick={onLoadSample}>Sample data</button>
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
