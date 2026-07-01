"""
Manual input endpoints - Amount Recovered from Employees (per month).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.manual_inputs import ManualInput
from app.schemas.manual_input_schemas import ManualInputIn, ManualInputOut

router = APIRouter(prefix="/api/manual-inputs", tags=["manual-inputs"])


@router.post("/{month}", response_model=ManualInputOut)
def set_manual_input(month: str, payload: ManualInputIn, db: Session = Depends(get_db)):
    record = db.query(ManualInput).filter(ManualInput.month == month).first()
    if record:
        record.amount_recovered_from_employees = payload.amount_recovered_from_employees
    else:
        record = ManualInput(month=month, amount_recovered_from_employees=payload.amount_recovered_from_employees)
        db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{month}", response_model=ManualInputOut)
def get_manual_input(month: str, db: Session = Depends(get_db)):
    record = db.query(ManualInput).filter(ManualInput.month == month).first()
    if not record:
        # Return zeroed default rather than 404 - frontend treats "no data yet" as 0
        return ManualInputOut(month=month, amount_recovered_from_employees=0.0)
    return record
