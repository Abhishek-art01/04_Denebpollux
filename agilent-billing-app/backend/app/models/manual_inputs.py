"""
ManualInput model - stores per-month manual entries that have no source
sheet, e.g. "Amount Recovered from Employees".
One row per month (Month is unique).
"""
from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class ManualInput(Base):
    __tablename__ = "manual_inputs"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, unique=True, index=True, nullable=False)
    amount_recovered_from_employees = Column(Float, default=0.0)
