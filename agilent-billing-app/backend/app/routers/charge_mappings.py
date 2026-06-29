"""
CRUD endpoints for the configurable keyword -> category mapping table,
used by the (optional) Settings page so the user can fix AdditionalCharges
keyword matches without a code change.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.charge_category_mapping import ChargeCategoryMapping
from app.schemas.manual_input_schemas import ChargeCategoryMappingIn, ChargeCategoryMappingOut
from app.services.addl_charges_mapper import ensure_default_mappings

router = APIRouter(prefix="/api/charge-mappings", tags=["charge-mappings"])

VALID_CATEGORIES = {"manpower", "technology", "dashcam", "razorpay", "other"}


@router.get("", response_model=list[ChargeCategoryMappingOut])
def list_mappings(db: Session = Depends(get_db)):
    ensure_default_mappings(db)
    return db.query(ChargeCategoryMapping).all()


@router.post("", response_model=ChargeCategoryMappingOut)
def create_mapping(payload: ChargeCategoryMappingIn, db: Session = Depends(get_db)):
    if payload.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"category must be one of {VALID_CATEGORIES}")
    record = ChargeCategoryMapping(keyword=payload.keyword, category=payload.category)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{mapping_id}")
def delete_mapping(mapping_id: int, db: Session = Depends(get_db)):
    record = db.query(ChargeCategoryMapping).filter(ChargeCategoryMapping.id == mapping_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Mapping not found.")
    db.delete(record)
    db.commit()
    return {"deleted": mapping_id}
