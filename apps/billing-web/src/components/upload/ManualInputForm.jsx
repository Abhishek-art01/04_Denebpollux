import React, { useEffect, useState } from "react";
import {
  fetchManualInput, setManualInput, fetchExpenses, setExpenses,
} from "../../api/manualInputs.js";

const EXPENSE_FIELDS = [
  { key: "fuel", label: "Fuel" },
  { key: "vehicle_maintenance_cost", label: "Vehicle Maintenance Cost" },
  { key: "drivers_salaries", label: "Drivers Salaries" },
  { key: "vehicle_emi", label: "Vehicle EMI" },
  { key: "vendor_payment", label: "Vendor Payment" },
  { key: "gst", label: "GST" },
  { key: "employee_salary", label: "Employee Salary" },
];

export default function ManualInputForm({ month }) {
  const [recovered, setRecovered] = useState("0");
  const [expenseValues, setExpenseValues] = useState(
    Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, "0"]))
  );
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    Promise.all([fetchManualInput(month), fetchExpenses(month)])
      .then(([manualInput, expenses]) => {
        setRecovered(String(manualInput.amount_recovered_from_employees ?? 0));
        const next = {};
        EXPENSE_FIELDS.forEach((f) => {
          next[f.key] = String(expenses[f.key] ?? 0);
        });
        setExpenseValues(next);
      })
      .catch((err) => console.error("Failed to load manual inputs", err))
      .finally(() => setLoading(false));
  }, [month]);

  async function handleSave() {
    setSaveStatus(null);
    try {
      await setManualInput(month, parseFloat(recovered) || 0);
      const expensePayload = Object.fromEntries(
        EXPENSE_FIELDS.map((f) => [f.key, parseFloat(expenseValues[f.key]) || 0])
      );
      await setExpenses(month, expensePayload);
      setSaveStatus({ type: "success", message: "Saved." });
    } catch (err) {
      console.error(err);
      setSaveStatus({ type: "error", message: "Failed to save. Try again." });
    }
  }

  if (!month) return null;
  if (loading) return <p style={{ color: "var(--ink-400)", fontSize: 13.5 }}>Loading manual inputs…</p>;

  return (
    <div className="card">
      <h2 className="card-title">Manual Monthly Inputs — {month}</h2>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="recovered">Amount Recovered from Employees (₹)</label>
          <input
            id="recovered"
            type="number"
            value={recovered}
            onChange={(e) => setRecovered(e.target.value)}
          />
        </div>

        {EXPENSE_FIELDS.map((f) => (
          <div className="form-field" key={f.key}>
            <label htmlFor={f.key}>{f.label} (₹)</label>
            <input
              id={f.key}
              type="number"
              value={expenseValues[f.key]}
              onChange={(e) =>
                setExpenseValues((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave}>
          Save inputs
        </button>
        {saveStatus && (
          <span
            style={{
              fontSize: 13,
              color: saveStatus.type === "success" ? "var(--positive-600)" : "var(--negative-600)",
              alignSelf: "center",
            }}
          >
            {saveStatus.message}
          </span>
        )}
      </div>
    </div>
  );
}
