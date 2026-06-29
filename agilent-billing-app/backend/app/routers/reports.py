"""
Report endpoints - one GET per dashboard, all parameterized by ?month=.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report_schemas import (
    RevenueSummaryReport, RevenueMixReport, VehicleBreakupReport,
    OwnershipBreakupReport, VehicleRevenueSummaryReport, PnlSummaryReport,
)
from app.services.revenue_calculator import calculate_revenue_summary, calculate_revenue_mix
from app.services.vehicle_breakup import calculate_vehicle_breakup, calculate_vehicle_revenue_summary
from app.services.ownership_breakup import calculate_ownership_breakup
from app.services.pnl_calculator import calculate_pnl_summary

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/revenue-summary", response_model=RevenueSummaryReport)
def get_revenue_summary(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_revenue_summary(db, month)


@router.get("/revenue-mix", response_model=RevenueMixReport)
def get_revenue_mix(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_revenue_mix(db, month)


@router.get("/vehicle-wise-breakup", response_model=VehicleBreakupReport)
def get_vehicle_wise_breakup(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_vehicle_breakup(db, month)


@router.get("/ownership-breakup", response_model=OwnershipBreakupReport)
def get_ownership_breakup(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_ownership_breakup(db, month)


@router.get("/vehicle-revenue-summary", response_model=VehicleRevenueSummaryReport)
def get_vehicle_revenue_summary(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_vehicle_revenue_summary(db, month)


@router.get("/pnl-summary", response_model=PnlSummaryReport)
def get_pnl_summary(month: str = Query(...), db: Session = Depends(get_db)):
    return calculate_pnl_summary(db, month)
