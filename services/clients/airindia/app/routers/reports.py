"""
Report endpoints - one GET per dashboard, all parameterized by ?month=.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report_schemas import RevenueSummaryReport, VehicleRevenueSummaryReport, PnlSummaryReport
from app.services.revenue_calculator import calculate_revenue_summary
from app.services.vehicle_revenue_summary import calculate_vehicle_revenue_summary
from app.services.pnl_calculator import calculate_pnl_summary

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/revenue-summary", response_model=RevenueSummaryReport)
def get_revenue_summary(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_revenue_summary(db, month)


@router.get("/vehicle-revenue-summary", response_model=VehicleRevenueSummaryReport)
def get_vehicle_revenue_summary(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_vehicle_revenue_summary(db, month)


@router.get("/pnl-summary", response_model=PnlSummaryReport)
def get_pnl_summary(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_pnl_summary(db, month)
