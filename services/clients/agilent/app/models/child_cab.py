"""
ChildCab model - mirrors the "ChildCab" Excel sheet.
Headers: S. No, Date, Employee Name, Time Period, Chauffer Name, VehicleNumber,
ownership, TripCost, Location, Month
"""
from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class ChildCab(Base):
    __tablename__ = "agilent_child_cab"

    id = Column(Integer, primary_key=True, index=True)
    s_no = Column(String, nullable=True)
    date = Column(Date, nullable=True)
    employee_name = Column(String, nullable=True)
    time_period = Column(String, nullable=True)
    chauffer_name = Column(String, nullable=True)
    vehicle_number = Column(String, index=True, nullable=False)
    ownership = Column(String, index=True, nullable=True)
    trip_cost = Column(Float, default=0.0)
    location = Column(String, nullable=True)
    month = Column(String, index=True, nullable=False)
