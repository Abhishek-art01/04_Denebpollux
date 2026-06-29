"""
Returns the distinct list of months that have any uploaded data, used to
populate the Month dropdown in the frontend Navbar.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.trip_data import TripData
from app.models.child_cab import ChildCab
from app.models.backup_cab import BackupCab
from app.models.maintenance_security import MaintenanceSecurity
from app.models.spot_rental import SpotRental
from app.models.additional_charges import AdditionalCharges

router = APIRouter(prefix="/api/months", tags=["months"])

MONTH_SOURCE_MODELS = [TripData, ChildCab, BackupCab, MaintenanceSecurity, SpotRental, AdditionalCharges]


@router.get("")
def list_months(db: Session = Depends(get_db)):
    months: set[str] = set()
    for model in MONTH_SOURCE_MODELS:
        results = db.query(model.month).distinct().all()
        months.update(r[0] for r in results if r[0])
    return {"months": sorted(months)}
