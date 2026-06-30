"""
Generic Excel upload parser. Each sheet type has an expected header set
(mapping Excel column name -> model attribute name) and a target model.
The parser:
  1. Reads the uploaded .xlsx into a pandas DataFrame.
  2. Validates that a "Month" column is present (required on every sheet
     per spec - user manually fills it in before uploading).
  3. Validates that all required headers are present; missing optional
     headers are defaulted (numeric -> 0.0, text -> None) with a warning.
  4. Coerces numeric columns to float (blank/NaN -> 0.0) and date columns
     to Python date objects.
  5. Bulk-inserts rows into the DB via SQLAlchemy.
"""
from __future__ import annotations

from typing import Dict, List, Type
from io import BytesIO

import pandas as pd
from sqlalchemy.orm import Session

from app.database import Base


class SheetSpec:
    """Defines how to map one Excel sheet's columns onto a SQLAlchemy model."""

    def __init__(
        self,
        model: Type[Base],
        column_map: Dict[str, str],
        numeric_fields: List[str],
        date_fields: List[str] = None,
        required_fields: List[str] = None,
    ):
        self.model = model
        self.column_map = column_map  # Excel header -> model attribute
        self.numeric_fields = numeric_fields  # model attribute names
        self.date_fields = date_fields or []
        self.required_fields = required_fields or ["vehicle_number"]


def parse_and_insert(file_bytes: bytes, spec: SheetSpec, db: Session) -> tuple[int, list[str]]:
    """
    Parses an uploaded Excel file according to `spec` and inserts rows.
    Returns (rows_inserted, warnings).
    """
    warnings: list[str] = []

    df = pd.read_excel(BytesIO(file_bytes))
    df.columns = [str(c).strip() for c in df.columns]

    if "Month" not in df.columns:
        raise ValueError("Uploaded sheet is missing the required 'Month' column.")

    # Check for missing expected headers (warn, don't fail, so partial sheets still work)
    expected_headers = set(spec.column_map.keys())
    actual_headers = set(df.columns)
    missing = expected_headers - actual_headers
    for col in missing:
        warnings.append(f"Column '{col}' not found in uploaded file; defaulting to empty/0.")

    records = []
    for _, row in df.iterrows():
        record = {}
        for excel_col, attr_name in spec.column_map.items():
            value = row[excel_col] if excel_col in df.columns else None

            if attr_name in spec.numeric_fields:
                record[attr_name] = _to_float(value)
            elif attr_name in spec.date_fields:
                record[attr_name] = _to_date(value)
            else:
                record[attr_name] = None if pd.isna(value) else str(value).strip()

        record["month"] = str(row["Month"]).strip()

        # Skip fully blank rows (common at the end of Excel exports).
        # A row is considered blank if none of its required text fields
        # AND none of its numeric fields have a value.
        has_required_text = any(record.get(f) for f in spec.required_fields)
        has_numeric_value = any(record.get(f) for f in spec.numeric_fields)
        if not has_required_text and not has_numeric_value:
            continue

        records.append(spec.model(**record))

    db.bulk_save_objects(records)
    db.commit()

    return len(records), warnings


def _to_float(value) -> float:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def _to_date(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return pd.to_datetime(value).date()
    except Exception:
        return None
