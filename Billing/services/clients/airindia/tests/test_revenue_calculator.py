"""
Unit tests for the Air India revenue calculator, using an in-memory
SQLite DB. Validates the locked formula spec against synthetic data.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.trip_data_terminal3 import TripDataTerminal3
from app.models.trip_data_aiaa import TripDataAIAA
from app.models.sundries import Sundries
from app.models.penalty_vehicle_wise import PenaltyVehicleWise
from app.models.manual_inputs import ManualInput
from app.services.revenue_calculator import calculate_revenue_summary, GST_RATE


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def test_revenue_summary_basic(db_session):
    month = "May-2026"

    db_session.add(TripDataTerminal3(cab_no="DL1AA1111", ownership="Other", trip_cost=100000, toll_amount=2000, month=month))
    db_session.add(Sundries(vehicle_no="DL1AA1111", veh_type="Sedan", ownership="Other", mcd=5000, month=month))
    db_session.add(PenaltyVehicleWise(vehicle_no="DL1AA1111", amount=1000, entity="T-3", month=month))
    db_session.add(ManualInput(month=month, employee_penalty_t3=500, employee_penalty_aiaa=300))

    db_session.add(TripDataAIAA(cab_no="DL1BB2222", ownership="DNP Own", trip_cost=80000, toll_amount=1500, month=month))
    db_session.add(PenaltyVehicleWise(vehicle_no="DL1BB2222", amount=700, entity="AIAA", month=month))
    db_session.commit()

    result = calculate_revenue_summary(db_session, month)

    assert result["trip_amount_t3"] == 100000
    assert result["toll_amount_t3"] == 2000
    assert result["mcd"] == 5000
    assert result["t3_driver_penalty"] == 1000
    assert result["t3_employee_penalty"] == 500
    expected_t3_total = 100000 + 2000 + 5000 - 1000 - 500
    assert result["total_of_terminal3"] == expected_t3_total

    assert result["trip_amount_aiaa"] == 80000
    assert result["toll_amount_aiaa"] == 1500
    assert result["aiaa_driver_penalty"] == 700
    assert result["aiaa_employee_penalty"] == 300
    expected_aiaa_total = 80000 + 1500 - 700 - 300
    assert result["total_of_aiaa"] == expected_aiaa_total

    assert result["total_taxable_amount"] == expected_t3_total + expected_aiaa_total
    assert result["gst_t3"] == round(expected_t3_total * GST_RATE, 10)
    assert result["gst_aiaa"] == round(expected_aiaa_total * GST_RATE, 10)
    assert result["total_revenue"] == result["total_taxable_amount"] + result["gst_total"]


def test_mcd_not_duplicated_into_aiaa(db_session):
    """MCD is T-3 only and must not leak into AIAA's total."""
    month = "May-2026"
    db_session.add(Sundries(vehicle_no="DL1AA1111", mcd=9999, month=month))
    db_session.add(TripDataAIAA(cab_no="DL1BB2222", trip_cost=1000, toll_amount=0, month=month))
    db_session.commit()

    result = calculate_revenue_summary(db_session, month)
    assert result["mcd"] == 9999
    # AIAA total should only reflect its own trip cost, no MCD bleed-through
    assert result["total_of_aiaa"] == 1000
