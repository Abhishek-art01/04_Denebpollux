"""
AdditionalCharges model - mirrors the "additional charges" Excel sheet.
Headers: Description, Taxable Amt., GST@18%, Total Amt., Month
"""
from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class AdditionalCharges(Base):
    __tablename__ = "agilent_additional_charges"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False, index=True)
    taxable_amt = Column(Float, default=0.0)
    gst_18_percent = Column(Float, default=0.0)
    total_amt = Column(Float, default=0.0)
    month = Column(String, index=True, nullable=False)
