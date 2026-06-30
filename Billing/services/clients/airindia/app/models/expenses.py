"""
Expense model - stores per-month manual expense entries used by the
PNL / MIS Report. One row per month (Month is unique).

Note: "MCD/State Taxs/Toll And Parking" is NOT stored here - it's
auto-calculated (SUNDRIES.MCD + TollAmount_T3 + TollAmount_AIAA) per the
locked spec, computed live in pnl_calculator.py rather than entered manually.
"""
from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, unique=True, index=True, nullable=False)

    # Vehicle Operating Costs (Own Vehicles)
    fuel = Column(Float, default=0.0)
    vehicle_maintenance_cost = Column(Float, default=0.0)
    drivers_salaries = Column(Float, default=0.0)
    vehicle_emi = Column(Float, default=0.0)

    # Technology & Software
    razorpay_transaction_fee = Column(Float, default=0.0)

    # Operational Expenses
    vendor_payment = Column(Float, default=0.0)
    employee_salary = Column(Float, default=0.0)

    # Taxes
    gst = Column(Float, default=0.0)
