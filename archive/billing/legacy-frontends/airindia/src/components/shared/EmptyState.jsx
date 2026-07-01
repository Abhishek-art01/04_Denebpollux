import React from "react";

export function EmptyState({ title = "No data yet", message = "Upload data for this month to see this report." }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function LoadingState({ message = "Loading…" }) {
  return <div className="loading-state">{message}</div>;
}
