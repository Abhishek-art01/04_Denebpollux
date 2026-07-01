from io import BytesIO

import pandas as pd
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.trip_data_terminal3 import TripDataTerminal3
from app.services.excel_parser import parse_and_insert
from app.services.sheet_specs import TRIP_DATA_TERMINAL3_SPEC


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def test_terminal3_upload_accepts_current_headers(db_session):
    headers = [
        "SR_NO",
        "TRIP_TYPE",
        "STAFF_COUNT",
        "BILL_MAKE",
        "DATE",
        "MONTH",
        "DUTY_TYPE",
        "DUTY_TYPE2",
        "UNA",
        "ROUTE_NO",
        "TRIP_ID",
        "EMPLOYEE_ID",
        "TEAM_TYPE",
        "GENDER",
        "EMPLOYEE_NAME",
        "EMPLOYEE_ADDRESS",
        "LOCATION",
        "BA_TIME",
        "ETD_TIME",
        "CAB_NO",
        "VEHICLE_NUMBER",
        "OWNERSHIP",
        "CAB_TYPE",
        "USE_KM",
        "CLUBBING_KM",
        "TOTAL_KM",
        "ONE_SIDE",
        "TWO_SIDE",
        "CLUB",
        "TOTAL",
        "BB",
        "PASS_KM",
        "DIFF",
        "MARSHALL",
        "REPORTING",
        "VENDOR",
        "TOLL_NAME",
        "TOLL_AMOUNT",
        "TRIP_COST",
        "TAXABLE_AMOUNT",
    ]
    row = dict.fromkeys(headers, "")
    row.update(
        {
            "SR_NO": "1",
            "STAFF_COUNT": 2,
            "DATE": "2026-06-01",
            "MONTH": "Jun-2026",
            "CAB_NO": "DL1AA1111",
            "VEHICLE_NUMBER": "DL1AA1111",
            "LOCATION": "Terminal 3",
            "PASS_KM": 12.5,
            "TRIP_COST": 1000,
            "TAXABLE_AMOUNT": 1000,
        }
    )

    buffer = BytesIO()
    with pd.ExcelWriter(buffer) as writer:
        pd.DataFrame([row], columns=headers).to_excel(writer, index=False)

    rows_inserted, warnings = parse_and_insert(
        buffer.getvalue(),
        TRIP_DATA_TERMINAL3_SPEC,
        db_session,
    )

    saved = db_session.query(TripDataTerminal3).one()
    assert rows_inserted == 1
    assert warnings == []
    assert saved.month == "Jun-2026"
    assert saved.cab_no == "DL1AA1111"
    assert saved.vehicle_number == "DL1AA1111"
    assert saved.location == "Terminal 3"
    assert saved.pass_km == 12.5
