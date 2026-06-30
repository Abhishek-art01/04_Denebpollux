"""
Expense model - stores per-month manual expense entries used by the
PNL / MIS Report. One row per month (Month is unique).
"""
from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, unique=True, index=True, nullable=False)

    fuel = Column(Float, default=0.0)
    vehicle_maintenance_cost = Column(Float, default=0.0)
    drivers_salaries = Column(Float, default=0.0)
    vehicle_emi = Column(Float, default=0.0)
    vendor_payment = Column(Float, default=0.0)
    gst = Column(Float, default=0.0)
    employee_salary = Column(Float, default=0.0)
