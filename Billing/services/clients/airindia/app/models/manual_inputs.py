"""
ManualInput model - stores per-month manual entries with no source sheet:
Employee Penalty for Terminal-3 and Employee Penalty for AIAA.
One row per month (Month is unique).
"""
from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class ManualInput(Base):
    __tablename__ = "manual_inputs"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, unique=True, index=True, nullable=False)
    employee_penalty_t3 = Column(Float, default=0.0)
    employee_penalty_aiaa = Column(Float, default=0.0)
