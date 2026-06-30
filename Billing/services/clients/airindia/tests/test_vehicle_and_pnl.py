"""
Unit tests for vehicle revenue summary (#2) and PNL calculator (#3).
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.trip_data_terminal3 import TripDataTerminal3
from app.models.trip_data_aiaa import TripDataAIAA
from app.models.penalty_vehicle_wise import PenaltyVehicleWise
from app.models.sundries import Sundries
from app.models.expenses import Expense
from app.services.vehicle_revenue_summary import calculate_vehicle_revenue_summary
from app.services.pnl_calculator import calculate_pnl_summary


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def test_vehicle_revenue_summary_nets_penalty(db_session):
    month = "May-2026"
    db_session.add(TripDataTerminal3(cab_no="DL1AA1111", ownership="Other", cab_type="Sedan", trip_cost=50000, month=month))
    db_session.add(TripDataAIAA(cab_no="DL1AA1111", ownership="Other", cab_type="SUV", trip_cost=30000, month=month))
    db_session.add(PenaltyVehicleWise(vehicle_no="DL1AA1111", amount=2000, entity="T-3", month=month))
    db_session.add(PenaltyVehicleWise(vehicle_no="DL1AA1111", amount=1000, entity="AIAA", month=month))
    db_session.commit()

    report = calculate_vehicle_revenue_summary(db_session, month)
    row = next(r for r in report["rows"] if r["vehicle_number"] == "DL1AA1111")

    assert row["t3_amount"] == 50000 - 2000
    assert row["aiaa_amount"] == 30000 - 1000
    assert row["total"] == row["t3_amount"] + row["aiaa_amount"]
    # T-3's Cab Type wins on conflict
    assert row["veh_type"] == "Sedan"


def test_pnl_includes_auto_calculated_mcd_toll_line(db_session):
    month = "May-2026"
    db_session.add(TripDataTerminal3(cab_no="DL1AA1111", trip_cost=10000, toll_amount=500, month=month))
    db_session.add(TripDataAIAA(cab_no="DL1BB2222", trip_cost=5000, toll_amount=300, month=month))
    db_session.add(Sundries(vehicle_no="DL1AA1111", mcd=2000, month=month))
    db_session.add(Expense(month=month, fuel=1000, drivers_salaries=2000))
    db_session.commit()

    report = calculate_pnl_summary(db_session, month)

    # MCD/Toll/Parking should be auto-calculated: 2000 (mcd) + 500 (t3 toll) + 300 (aiaa toll)
    assert report["mcd_state_taxes_toll_parking"]["amount"] == 2800
    assert report["fuel"]["amount"] == 1000
    assert report["drivers_salaries"]["amount"] == 2000
