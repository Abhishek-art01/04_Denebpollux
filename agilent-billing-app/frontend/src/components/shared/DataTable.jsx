import React from "react";

/**
 * Generic data table.
 * columns: [{ key, label, numeric, render }]
 * rows: array of objects
 * footer: optional array matching columns shape with totals (rendered in <tfoot>)
 */
export default function DataTable({ columns, rows, footer, rowClassName }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.numeric ? "numeric" : ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx} className={rowClassName ? rowClassName(row) : ""}>
              {columns.map((col) => (
                <td key={col.key} className={col.numeric ? "numeric" : ""}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--ink-400)", padding: "24px" }}>
                No data for this month yet.
              </td>
            </tr>
          )}
        </tbody>
        {footer && (
          <tfoot>
            <tr>
              {columns.map((col) => (
                <td key={col.key} className={col.numeric ? "numeric" : ""}>
                  {footer[col.key] !== undefined ? footer[col.key] : ""}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
