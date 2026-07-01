from typing import List
from pydantic import BaseModel


class UploadResponse(BaseModel):
    sheet: str
    month: str
    rows_inserted: int
    warnings: List[str] = []
