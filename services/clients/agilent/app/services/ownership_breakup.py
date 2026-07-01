"""
Report #4: Revenue by Ownership Type - derived from Report #3
(Vehicle-wise Revenue Breakup), grouped by Ownership ("DNP Own" / "Other").
"""
from sqlalchemy.orm import Session

from app.services.vehicle_breakup import calculate_vehicle_breakup


def calculate_ownership_breakup(db: Session, month: str) -> dict:
    breakup = calculate_vehicle_breakup(db, month)
    rows = breakup["rows"]

    totals_by_ownership: dict[str, float] = {}
    for row in rows:
        ownership = row["ownership"] or "Other"
        totals_by_ownership[ownership] = totals_by_ownership.get(ownership, 0.0) + row["grand_total"]

    grand_total = sum(totals_by_ownership.values())

    result_rows = []
    for ownership, amount in sorted(totals_by_ownership.items()):
        pct = (amount / grand_total * 100) if grand_total else 0.0
        result_rows.append({
            "ownership_type": ownership,
            "total_revenue": amount,
            "percent_of_total": round(pct, 2),
        })

    return {"month": month, "rows": result_rows, "total": grand_total}
