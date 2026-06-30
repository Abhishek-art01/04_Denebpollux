"""
FastAPI application entrypoint for the Air India billing app. Creates DB
tables on startup, registers CORS, and includes all routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import settings
from app.database import Base, engine, ensure_schema
from app import models  # noqa: F401 - ensures all models are registered on Base
from app.routers import upload, manual_inputs, expenses, reports, export, months

app = FastAPI(title="Air India (Agilent) Billing Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(manual_inputs.router)
app.include_router(expenses.router)
app.include_router(reports.router)
app.include_router(export.router)
app.include_router(months.router)


@app.on_event("startup")
def on_startup():
    ensure_schema()
    Base.metadata.create_all(bind=engine)
    _ensure_terminal3_upload_columns()


def _ensure_terminal3_upload_columns():
    """Add columns introduced by the current Terminal 3 upload format."""
    table_name = "airindia_trip_data_terminal3"
    inspector = inspect(engine)
    if not inspector.has_table(table_name, schema=settings.db_schema or None):
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns(table_name, schema=settings.db_schema or None)
    }
    required_columns = {
        "sr_no": "VARCHAR",
        "trip_type": "VARCHAR",
        "staff_count": "FLOAT",
        "bill_make": "VARCHAR",
        "date": "DATE",
        "month": "VARCHAR",
        "duty_type": "VARCHAR",
        "duty_type2": "VARCHAR",
        "una": "VARCHAR",
        "route_no": "VARCHAR",
        "trip_id": "VARCHAR",
        "employee_id": "VARCHAR",
        "team_type": "VARCHAR",
        "gender": "VARCHAR",
        "employee_name": "VARCHAR",
        "employee_address": "VARCHAR",
        "location": "VARCHAR",
        "ba_time": "VARCHAR",
        "etd_time": "VARCHAR",
        "cab_no": "VARCHAR",
        "vehicle_number": "VARCHAR",
        "ownership": "VARCHAR",
        "cab_type": "VARCHAR",
        "use_km": "FLOAT",
        "clubbing_km": "FLOAT",
        "total_km": "FLOAT",
        "one_side": "VARCHAR",
        "two_side": "VARCHAR",
        "club": "VARCHAR",
        "total": "FLOAT",
        "bb": "VARCHAR",
        "pass_km": "FLOAT",
        "diff": "FLOAT",
        "marshall": "VARCHAR",
        "reporting": "VARCHAR",
        "vendor": "VARCHAR",
        "toll_name": "VARCHAR",
        "toll_amount": "FLOAT",
        "trip_cost": "FLOAT",
        "taxable_amount": "FLOAT",
    }

    if settings.db_schema:
        qualified_table = f'"{settings.db_schema}"."{table_name}"'
    else:
        qualified_table = f'"{table_name}"'

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(f'ALTER TABLE {qualified_table} ADD COLUMN "{column_name}" {column_type}')
                )


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
