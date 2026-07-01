import React, { useEffect, useState } from "react";
import {
  fetchManualInput, setManualInput, fetchExpenses, setExpenses,
} from "../../api/manualInputs.js";

const EXPENSE_FIELDS = [
  { key: "fuel", label: "Fuel" },
  { key: "vehicle_maintenance_cost", label: "Vehicle Maintenance Cost" },
  { key: "drivers_salaries", label: "Drivers Salaries" },
  { key: "vehicle_emi", label: "Vehicle EMI" },
  { key: "razorpay_transaction_fee", label: "Razorpay Transaction Fee" },
  { key: "vendor_payment", label: "Vendor Payment" },
  { key: "employee_salary", label: "Employee Salary" },
  { key: "gst", label: "GST (expense-side)" },
];

export default function ManualInputForm({ month }) {
  const [penaltyT3, setPenaltyT3] = useState("0");
  const [penaltyAiaa, setPenaltyAiaa] = useState("0");
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
        setPenaltyT3(String(manualInput.employee_penalty_t3 ?? 0));
        setPenaltyAiaa(String(manualInput.employee_penalty_aiaa ?? 0));
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
      await setManualInput(month, parseFloat(penaltyT3) || 0, parseFloat(penaltyAiaa) || 0);
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

      <div className="section-label">Employee Penalty (not in any uploaded sheet)</div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="penalty-t3">Employee Penalty — Terminal-3 (₹)</label>
          <input id="penalty-t3" type="number" value={penaltyT3} onChange={(e) => setPenaltyT3(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="penalty-aiaa">Employee Penalty — AIAA (₹)</label>
          <input id="penalty-aiaa" type="number" value={penaltyAiaa} onChange={(e) => setPenaltyAiaa(e.target.value)} />
        </div>
      </div>

      <div className="section-label">Expenses (PNL/MIS only)</div>
      <div className="form-grid">
        {EXPENSE_FIELDS.map((f) => (
          <div className="form-field" key={f.key}>
            <label htmlFor={f.key}>{f.label} (₹)</label>
            <input
              id={f.key}
              type="number"
              value={expenseValues[f.key]}
              onChange={(e) => setExpenseValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 10 }}>
        Note: "MCD/State Taxs/Toll And Parking" is not entered here — it's calculated
        automatically from SUNDRIES.MCD + TollAmount(T-3) + TollAmount(AIAA).
      </p>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave}>Save inputs</button>
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
