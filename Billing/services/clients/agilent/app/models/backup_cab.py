"""
BackupCab model - mirrors the "BackupCab" Excel sheet.
Headers: Date, Time Period, Time Period 2, VehicleNumber, Ownership, Tripcost,
Cab Details, Location, Remark, Month
"""
from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class BackupCab(Base):
    __tablename__ = "backup_cab"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=True)
    time_period = Column(String, nullable=True)
    time_period_2 = Column(String, nullable=True)
    vehicle_number = Column(String, index=True, nullable=False)
    ownership = Column(String, index=True, nullable=True)
    trip_cost = Column(Float, default=0.0)
    cab_details = Column(String, nullable=True)
    location = Column(String, nullable=True)
    remark = Column(String, nullable=True)
    month = Column(String, index=True, nullable=False)
