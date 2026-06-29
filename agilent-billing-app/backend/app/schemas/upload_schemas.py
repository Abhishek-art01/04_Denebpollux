"""
Schemas for the upload endpoints - all uploads return the same shape:
how many rows were inserted, which month they were tagged with, and any
row-level warnings (e.g. missing optional fields defaulted to 0/blank).
"""
from typing import List
from pydantic import BaseModel


class UploadResponse(BaseModel):
    sheet: str
    month: str
    rows_inserted: int
    warnings: List[str] = []
