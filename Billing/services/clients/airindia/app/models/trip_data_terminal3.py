"""
TripDataTerminal3 model - mirrors the "Trip_Data_TERMINAL-3" Excel sheet.
"""
from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class TripDataTerminal3(Base):
    __tablename__ = "trip_data_terminal3"

    id = Column(Integer, primary_key=True, index=True)
    s_no = Column(String, nullable=True)
    trip_type = Column(String, nullable=True)
    staff_count = Column(Float, default=0.0)
    bill_make = Column(String, nullable=True)
    date = Column(Date, nullable=True)
    duty_type = Column(String, nullable=True)
    duty_type2 = Column(String, nullable=True)
    una = Column(String, nullable=True)
    route_no = Column(String, nullable=True)
    trip_id = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    team_type = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    employee_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    ba_time = Column(String, nullable=True)
    etd_time = Column(String, nullable=True)
    cab_no = Column(String, index=True, nullable=False)
    cab_no_2 = Column(String, nullable=True)
    cab_type = Column(String, nullable=True)
    use_km = Column(Float, default=0.0)
    clubbing_km = Column(Float, default=0.0)
    total_km = Column(Float, default=0.0)
    one_side = Column(String, nullable=True)
    two_side = Column(String, nullable=True)
    club = Column(String, nullable=True)
    bb = Column(String, nullable=True)
    total = Column(Float, default=0.0)
    diff = Column(Float, default=0.0)
    marshall = Column(String, nullable=True)
    reporting_at = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    ownership = Column(String, index=True, nullable=True)
    toll_name = Column(String, nullable=True)
    toll_amount = Column(Float, default=0.0)
    trip_cost = Column(Float, default=0.0)
    taxable_amount = Column(Float, default=0.0)
    month = Column(String, index=True, nullable=False)
