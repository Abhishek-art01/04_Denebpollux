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
    TRIP_DATA_TERMINAL3_SPEC, TRIP_DATA_AIAA_SPEC, SUNDRIES_SPEC, PENALTY_VEHICLE_WISE_SPEC,
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

    import pandas as pd
    from io import BytesIO
    df = pd.read_excel(BytesIO(file_bytes))
    df.columns = [str(column).strip() for column in df.columns]
    month_column = "Month" if "Month" in df.columns else "MONTH" if "MONTH" in df.columns else None
    month_values = df[month_column].dropna() if month_column else []
    month_value = str(month_values.iloc[0]).strip() if len(month_values) else "unknown"

    return UploadResponse(sheet=sheet_name, month=month_value, rows_inserted=rows_inserted, warnings=warnings)


@router.post("/trip-data-terminal3", response_model=UploadResponse)
def upload_trip_data_terminal3(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, TRIP_DATA_TERMINAL3_SPEC, "Trip_Data_TERMINAL-3", db)


@router.post("/trip-data-aiaa", response_model=UploadResponse)
def upload_trip_data_aiaa(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, TRIP_DATA_AIAA_SPEC, "Trip_Data_AIAA", db)


@router.post("/sundries", response_model=UploadResponse)
def upload_sundries(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, SUNDRIES_SPEC, "SUNDRIES", db)


@router.post("/penalty-vehicle-wise", response_model=UploadResponse)
def upload_penalty_vehicle_wise(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return _handle_upload(file, PENALTY_VEHICLE_WISE_SPEC, "penalty_VehicleWise", db)
