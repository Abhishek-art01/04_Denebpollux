"""
ChargeCategoryMapping model - configurable keyword -> category mapping
used to classify AdditionalCharges rows (by Description text) into:
Manpower Charges / Technology Cost Recovery / Dashcam Subscription Recovery /
Razorpay Transaction Fee Recovery / Other.

Stored in DB (rather than hardcoded) so mismatches can be fixed via the
Settings page without a code change.
"""
from sqlalchemy import Column, Integer, String

from app.database import Base


class ChargeCategoryMapping(Base):
    __tablename__ = "charge_category_mappings"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False, unique=True)  # text to match in Description (case-insensitive substring)
    category = Column(String, nullable=False)  # one of: manpower | technology | dashcam | razorpay | other
