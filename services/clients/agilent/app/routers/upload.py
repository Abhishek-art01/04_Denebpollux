"""
Upload endpoints - one per sheet type. Each accepts a .xlsx file,
validates/parses it via the shared excel_parser service, and bulk-inserts
rows into the corresponding table.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.upload_schemas import UploadResponse
from app.services.excel_parser import parse_and_insert
from app.services.sheet_specs import (
    TRIP_DATA_SPEC, CHILD_CAB_SPEC, BACKUP_CAB_SPEC,
    MAINTENANCE_SECURITY_SPEC, SPOT_RENTAL_SPEC, ADDITIONAL_CHARGES_SPEC,
)

router = APIRouter(prefix="/api/upload", tags=["upload"])


def _handle_upload(file: UploadFile, spec, sheet_name: str, db: Session) -> UploadResponse:
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files are accepted.")

    file_bytes = file.file.read()
    try:
        rows_inserted, warnings = parse_and_insert(file_bytes, spec, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if rows_inserted == 0:
        raise HTTPException(status_code=400, detail="No valid rows found in the uploaded file.")

    # Month is read off the first inserted record's intent (re-derive from file for response)
    import pandas as pd
    from io import BytesIO
    df = pd.read_excel(BytesIO(file_bytes))
    month_value = str(df["Month"].dropna().iloc[0]).strip() if "Month" in df.columns and not df["Month"].dropna().empty else "unknown"

    return UploadResponse(sheet=sheet_name, month=month_value, rows_inserted=rows_inserted, warnings=warnings)


@router.post("/trip-data", response_model=UploadResponse)
def upload_trip_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, TRIP_DATA_SPEC, "TripData", db)


@router.post("/child-cab", response_model=UploadResponse)
def upload_child_cab(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, CHILD_CAB_SPEC, "ChildCab", db)


@router.post("/backup-cab", response_model=UploadResponse)
def upload_backup_cab(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, BACKUP_CAB_SPEC, "BackupCab", db)


@router.post("/maintenance-security", response_model=UploadResponse)
def upload_maintenance_security(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, MAINTENANCE_SECURITY_SPEC, "MaintenanceSecurity", db)


@router.post("/spot-rental", response_model=UploadResponse)
def upload_spot_rental(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, SPOT_RENTAL_SPEC, "SpotRental", db)


@router.post("/additional-charges", response_model=UploadResponse)
def upload_additional_charges(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, ADDITIONAL_CHARGES_SPEC, "AdditionalCharges", db)
