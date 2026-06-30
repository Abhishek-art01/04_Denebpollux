"""
TripData model - mirrors the "TripData" Excel sheet uploaded by the user.
Headers: Plan ID, Roster Employee's, Shift, Direction, Shift Date, VehicleNumber,
Ownership, Driver Name, Make, Zone Name, Biiling Zone, TripCost, MCD, HR Tax,
Raj. & UP Tax, FBD Toll, Bijwasan Toll, Manesar Toll, Taxable Amount, Toll, Remarks, Month
"""
from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class TripData(Base):
    __tablename__ = "trip_data"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(String, nullable=True)
    roster_employee = Column(String, nullable=True)
    shift = Column(String, nullable=True)
    direction = Column(String, nullable=True)
    shift_date = Column(Date, nullable=True)
    vehicle_number = Column(String, index=True, nullable=False)
    ownership = Column(String, index=True, nullable=True)
    driver_name = Column(String, nullable=True)
    make = Column(String, nullable=True)
    zone_name = Column(String, nullable=True)
    billing_zone = Column(String, nullable=True)
    trip_cost = Column(Float, default=0.0)
    mcd = Column(Float, default=0.0)
    hr_tax = Column(Float, default=0.0)
    raj_up_tax = Column(Float, default=0.0)
    fbd_toll = Column(Float, default=0.0)
    bijwasan_toll = Column(Float, default=0.0)
    manesar_toll = Column(Float, default=0.0)
    taxable_amount = Column(Float, default=0.0)
    toll = Column(Float, default=0.0)
    remarks = Column(String, nullable=True)
    month = Column(String, index=True, nullable=False)  # e.g. "May-2026"
