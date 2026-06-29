"""
Export endpoints - generate a downloadable .xlsx for any of the 6 reports.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.revenue_calculator import calculate_revenue_summary, calculate_revenue_mix
from app.services.vehicle_breakup import calculate_vehicle_breakup, calculate_vehicle_revenue_summary
from app.services.ownership_breakup import calculate_ownership_breakup
from app.services.pnl_calculator import calculate_pnl_summary
from app.utils.excel_export import (
    export_revenue_summary, export_revenue_mix, export_vehicle_breakup,
    export_ownership_breakup, export_vehicle_revenue_summary, export_pnl_summary,
)

router = APIRouter(prefix="/api/export", tags=["export"])

REPORT_REGISTRY = {
    "revenue-summary": (calculate_revenue_summary, export_revenue_summary, "Revenue_Summary"),
    "revenue-mix": (calculate_revenue_mix, export_revenue_mix, "Revenue_Mix"),
    "vehicle-breakup": (calculate_vehicle_breakup, export_vehicle_breakup, "Vehicle_Wise_Breakup"),
    "ownership-breakup": (calculate_ownership_breakup, export_ownership_breakup, "Ownership_Breakup"),
    "vehicle-revenue-summary": (calculate_vehicle_revenue_summary, export_vehicle_revenue_summary, "Vehicle_Revenue_Summary"),
    "pnl-summary": (calculate_pnl_summary, export_pnl_summary, "PNL_Summary"),
}


@router.get("/{report_type}")
def export_report(
    report_type: str,
    month: str = Query(...),
    db: Session = Depends(get_db),
):
    if report_type not in REPORT_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Unknown report type '{report_type}'.")

    calculate_fn, export_fn, filename_prefix = REPORT_REGISTRY[report_type]
    report_data = calculate_fn(db, month)
    buffer = export_fn(report_data)

    filename = f"Agilent_{filename_prefix}_{month}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
