"""
MaintenanceSecurity model - mirrors the "MaintinanceSecurity" Excel sheet.
Headers: Dated, Shift time, VehicleNumber, Ownership, TripCost, Make, Driver,
Location, Order, Month
"""
from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class MaintenanceSecurity(Base):
    __tablename__ = "agilent_maintenance_security"

    id = Column(Integer, primary_key=True, index=True)
    dated = Column(Date, nullable=True)
    shift_time = Column(String, nullable=True)
    vehicle_number = Column(String, index=True, nullable=False)
    ownership = Column(String, index=True, nullable=True)
    trip_cost = Column(Float, default=0.0)
    make = Column(String, nullable=True)
    driver = Column(String, nullable=True)
    location = Column(String, nullable=True)
    order = Column(String, nullable=True)
    month = Column(String, index=True, nullable=False)
