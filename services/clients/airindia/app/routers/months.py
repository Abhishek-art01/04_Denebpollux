"""
Returns the distinct list of months that have any uploaded data, used to
populate the Month dropdown in the frontend Navbar.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.trip_data_terminal3 import TripDataTerminal3
from app.models.trip_data_aiaa import TripDataAIAA
from app.models.sundries import Sundries
from app.models.penalty_vehicle_wise import PenaltyVehicleWise

router = APIRouter(prefix="/api/months", tags=["months"])

MONTH_SOURCE_MODELS = [TripDataTerminal3, TripDataAIAA, Sundries, PenaltyVehicleWise]


@router.get("")
def list_months(db: Session = Depends(get_db)):
    months: set[str] = set()
    for model in MONTH_SOURCE_MODELS:
        results = db.query(model.month).distinct().all()
        months.update(r[0] for r in results if r[0])
    return {"months": sorted(months)}
