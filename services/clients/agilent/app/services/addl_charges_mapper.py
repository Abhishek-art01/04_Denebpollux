"""
Classifies AdditionalCharges rows into one of:
  manpower | technology | dashcam | razorpay | other
by matching the Description column against a configurable keyword table
(charge_category_mappings). Falls back to a sensible default mapping on
first run if the table is empty, so the app works out of the box.
"""
from sqlalchemy.orm import Session

from app.models.charge_category_mapping import ChargeCategoryMapping
from app.models.additional_charges import AdditionalCharges

DEFAULT_MAPPINGS = [
    ("manpower", "manpower"),
    ("technology", "technology"),
    ("tech cost", "technology"),
    ("dashcam", "dashcam"),
    ("razorpay", "razorpay"),
]


def ensure_default_mappings(db: Session) -> None:
    """Seeds default keyword mappings if the table is empty."""
    existing = db.query(ChargeCategoryMapping).count()
    if existing > 0:
        return
    for keyword, category in DEFAULT_MAPPINGS:
        db.add(ChargeCategoryMapping(keyword=keyword, category=category))
    db.commit()


def categorize_charge(description: str, mappings: list[ChargeCategoryMapping]) -> str:
    """Returns the category for a given Description string, or 'other'."""
    if not description:
        return "other"
    desc_lower = description.lower()
    for mapping in mappings:
        if mapping.keyword.lower() in desc_lower:
            return mapping.category
    return "other"


def get_additional_charges_totals(db: Session, month: str) -> dict:
    """
    Returns a dict with summed Taxable Amt. for each known category,
    for the given month, e.g.:
    {"manpower": 293500.0, "technology": 37840.0, "dashcam": 26562.0, "razorpay": 22987.0, "other": 0.0}
    """
    ensure_default_mappings(db)
    mappings = db.query(ChargeCategoryMapping).all()

    rows = db.query(AdditionalCharges).filter(AdditionalCharges.month == month).all()

    totals = {"manpower": 0.0, "technology": 0.0, "dashcam": 0.0, "razorpay": 0.0, "other": 0.0}
    for row in rows:
        category = categorize_charge(row.description, mappings)
        totals[category] = totals.get(category, 0.0) + (row.taxable_amt or 0.0)

    return totals
