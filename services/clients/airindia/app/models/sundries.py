"""
Sundries model - mirrors the "SUNDRIES" Excel sheet.
Headers: Vehicle No., VEH. NO., VEH. TYPE, MCD, No. of working Days, Month
(+ Ownership, added per user confirmation so VehicleRevenueSummary can
source ownership from any of the 4 sheets).

IMPORTANT: "Vehicle No." (billing-name) is the join key that matches
CabNo./CAB NO in Trip_Data_TERMINAL-3 / Trip_Data_AIAA. "VEH. NO." is the
vehicle's registration number, stored for reference/display only and is
NOT used in any join or aggregation.
"""
from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class Sundries(Base):
    __tablename__ = "airindia_sundries"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_no = Column(String, index=True, nullable=False)  # "Vehicle No." - JOIN KEY (matches CabNo./CAB NO)
    veh_no = Column(String, nullable=True)                   # "VEH. NO." - registration number, display only
    veh_type = Column(String, nullable=True)
    ownership = Column(String, index=True, nullable=True)
    mcd = Column(Float, default=0.0)
    no_of_working_days = Column(Float, default=0.0)
    month = Column(String, index=True, nullable=False)
