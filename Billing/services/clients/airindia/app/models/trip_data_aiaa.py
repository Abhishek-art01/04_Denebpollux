"""
TripDataAIAA model - mirrors the "Trip_Data_AIAA" Excel sheet.
"""
from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class TripDataAIAA(Base):
    __tablename__ = "airindia_trip_data_aiaa"

    id = Column(Integer, primary_key=True, index=True)
    sr_no = Column(String, nullable=True)
    staff = Column(Float, default=0.0)
    bill_count = Column(Float, default=0.0)
    date = Column(Date, nullable=True)
    duty_type = Column(String, nullable=True)
    una = Column(String, nullable=True)
    route_no = Column(String, nullable=True)
    trip_id = Column(String, nullable=True)
    emp_id = Column(String, nullable=True)
    team_type = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    emp_name = Column(String, nullable=True)
    employee_address = Column(String, nullable=True)
    location = Column(String, nullable=True)
    pickup_time = Column(String, nullable=True)
    reporting_time = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    ownership = Column(String, index=True, nullable=True)
    cab_no = Column(String, index=True, nullable=False)
    vehicle_number = Column(String, nullable=True)
    cab_type = Column(String, nullable=True)
    use_zone_km = Column(Float, default=0.0)
    claim = Column(Float, default=0.0)
    pass_zone = Column(String, nullable=True)
    pass_amount = Column(Float, default=0.0)
    guard_cost = Column(Float, default=0.0)
    guard = Column(String, nullable=True)
    toll_name = Column(String, nullable=True)
    toll_amount = Column(Float, default=0.0)
    reporting_area = Column(String, nullable=True)
    bill_at = Column(String, nullable=True)
    trg_type = Column(String, nullable=True)
    trip_cost = Column(Float, default=0.0)
    taxable_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    month = Column(String, index=True, nullable=False)
