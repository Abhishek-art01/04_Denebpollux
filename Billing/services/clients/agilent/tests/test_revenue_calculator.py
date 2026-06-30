"""
Unit tests for the revenue calculator service, using an in-memory SQLite
DB so tests run without a real PostgreSQL instance. Validates the locked
formula spec end-to-end against synthetic data.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.trip_data import TripData
from app.models.child_cab import ChildCab
from app.models.backup_cab import BackupCab
from app.models.maintenance_security import MaintenanceSecurity
from app.models.spot_rental import SpotRental
from app.models.additional_charges import AdditionalCharges
from app.models.manual_inputs import ManualInput
from app.services.revenue_calculator import calculate_revenue_summary


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

    db_session.add(TripData(vehicle_number="DL1ZC9446", ownership="Other", trip_cost=30000, taxable_amount=29000, month=month))
    db_session.add(MaintenanceSecurity(vehicle_number="HR38AB1486", ownership="DNP Own", trip_cost=9500, month=month))
    db_session.add(ChildCab(vehicle_number="HR38AB1486", ownership="DNP Own", trip_cost=1650, month=month))
    db_session.add(BackupCab(vehicle_number="HR38AB1486", ownership="DNP Own", trip_cost=12500, month=month))
    db_session.add(SpotRental(vehicle_number="HR38AA9664", ownership="Other", without_gst_total_amount=4910, total_billing_items_amount=4910, month=month))
    db_session.add(ManualInput(month=month, amount_recovered_from_employees=1000))
    db_session.add(AdditionalCharges(description="Manpower Charges - May", taxable_amt=2000, month=month))
    db_session.commit()

    result = calculate_revenue_summary(db_session, month)

    assert result["total_trip_amount"] == 29000
    assert result["maintenance_charges"] == 9500
    assert result["creche_duty_charges"] == 1650
    assert result["odd_hours_cab_cost"] == 12500
    assert result["grand_total_billable"] == 29000 + 9500 + 1650 + 12500
    assert result["amount_recovered_from_employees"] == 1000
    assert result["taxable_trip_amount"] == result["grand_total_billable"] - 1000
    assert result["manpower_charges"] == 2000
    assert result["spot_rental_revenue"] == 4910  # uses Without GST Total Amount only for report #1
    assert result["cgst_total"] == round(result["total_taxable_amount"] * 0.09, 10)
    assert result["net_amount_payable_by_agilent"] == result["total_taxable_amount"] + result["cgst_total"] + result["sgst_total"]
    assert result["total_revenue"] == result["net_amount_payable_by_agilent"] + result["amount_recovered_from_employees"]


def test_revenue_summary_empty_month_returns_zeroes(db_session):
    result = calculate_revenue_summary(db_session, "Jan-2099")
    assert result["total_trip_amount"] == 0.0
    assert result["total_revenue"] == 0.0
