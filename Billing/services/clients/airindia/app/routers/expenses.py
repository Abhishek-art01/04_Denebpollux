"""
Expense endpoints - PNL/MIS report's manual expense inputs (per month).
Note: MCD/State Taxes/Toll And Parking is NOT here - it's auto-calculated.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.expenses import Expense
from app.schemas.manual_input_schemas import ExpenseIn, ExpenseOut

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.post("/{month}", response_model=ExpenseOut)
def set_expenses(month: str, payload: ExpenseIn, db: Session = Depends(get_db)):
    record = db.query(Expense).filter(Expense.month == month).first()
    if record:
        for field, value in payload.model_dump().items():
            setattr(record, field, value)
    else:
        record = Expense(month=month, **payload.model_dump())
        db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{month}", response_model=ExpenseOut)
def get_expenses(month: str, db: Session = Depends(get_db)):
    record = db.query(Expense).filter(Expense.month == month).first()
    if not record:
        return ExpenseOut(month=month)
    return record
