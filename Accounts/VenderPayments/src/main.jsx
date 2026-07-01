import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const STORAGE_KEY = "denebpollux_vendor_payments";

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

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function loadEntries() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function getRule(ruleId) {
  return RATE_RULES.find((rule) => rule.id === ruleId) || RATE_RULES[0];
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

function App() {
  const [entry, setEntry] = useState(EMPTY_ENTRY);
  const [entries, setEntries] = useState(loadEntries);
  const [query, setQuery] = useState("");

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

  function saveEntries(nextEntries) {
    setEntries(nextEntries);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  }

  function submitEntry(event) {
    event.preventDefault();
    const trimmedVendor = entry.vendor.trim();
    const trimmedVehicle = entry.vehicleNumber.trim();
    if (!trimmedVendor || !trimmedVehicle) return;

    const nextEntry = {
      ...entry,
      id: crypto.randomUUID(),
      vendor: trimmedVendor,
      vehicleNumber: trimmedVehicle.toUpperCase(),
      quantity: Number(entry.quantity) || 0,
      deduction: Number(entry.deduction) || 0,
      createdAt: new Date().toISOString(),
    };
    saveEntries([nextEntry, ...entries]);
    setEntry(EMPTY_ENTRY);
  }

  function removeEntry(id) {
    saveEntries(entries.filter((item) => item.id !== id));
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

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="material-symbols-outlined" aria-hidden="true">payments</span>
          <div>
            <strong>Vendor Payments</strong>
            <span>Accounts</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Payment sections">
          <button className="nav-item active" type="button">
            <span className="material-symbols-outlined" aria-hidden="true">receipt_long</span>
            Register
          </button>
          <button className="nav-item" type="button">
            <span className="material-symbols-outlined" aria-hidden="true">rule</span>
            Agilent Rules
          </button>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Deneb & Pollux</span>
            <h1>Vendor Payment Register</h1>
          </div>
          <button className="icon-button" type="button" onClick={exportCsv} title="Export CSV" disabled={!entries.length}>
            <span className="material-symbols-outlined" aria-hidden="true">download</span>
          </button>
        </header>

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
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
