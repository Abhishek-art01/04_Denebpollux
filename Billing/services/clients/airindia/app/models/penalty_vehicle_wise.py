"""
PenaltyVehicleWise model - mirrors the "penalty_VehicleWise" Excel sheet.
Original headers: vehicleNO, Amount, Remark.
Per locked spec, a new "Entity" column is required (values: "T-3" or
"AIAA") so driver penalties can be attributed to the correct revenue
bucket. The vehicle number here is expected to match the same "Vehicle No."
/ CabNo. join key used across Trip_Data_TERMINAL-3, Trip_Data_AIAA, and
SUNDRIES.
"""
from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class PenaltyVehicleWise(Base):
    __tablename__ = "penalty_vehicle_wise"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_no = Column(String, index=True, nullable=False)
    amount = Column(Float, default=0.0)
    remark = Column(String, nullable=True)
    entity = Column(String, index=True, nullable=False)  # "T-3" or "AIAA"
    ownership = Column(String, index=True, nullable=True)
    month = Column(String, index=True, nullable=False)
