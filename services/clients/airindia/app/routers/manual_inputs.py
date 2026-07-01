"""
Manual input endpoints - Employee Penalty (Terminal-3 and AIAA), per month.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.manual_inputs import ManualInput
from app.schemas.manual_input_schemas import ManualInputIn, ManualInputOut

router = APIRouter(prefix="/api/manual-inputs", tags=["manual-inputs"])


@router.post("/{month}", response_model=ManualInputOut)
def set_manual_input(month: str, payload: ManualInputIn, db: Session = Depends(get_db)):
    record = db.query(ManualInput).filter(ManualInput.month == month).first()
    if record:
        record.employee_penalty_t3 = payload.employee_penalty_t3
        record.employee_penalty_aiaa = payload.employee_penalty_aiaa
    else:
        record = ManualInput(
            month=month,
            employee_penalty_t3=payload.employee_penalty_t3,
            employee_penalty_aiaa=payload.employee_penalty_aiaa,
        )
        db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{month}", response_model=ManualInputOut)
def get_manual_input(month: str, db: Session = Depends(get_db)):
    record = db.query(ManualInput).filter(ManualInput.month == month).first()
    if not record:
        return ManualInputOut(month=month, employee_penalty_t3=0.0, employee_penalty_aiaa=0.0)
    return record
