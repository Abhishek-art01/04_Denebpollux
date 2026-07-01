"""
Unit tests for vehicle breakup (#3, #5) and PNL calculator (#6).
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.trip_data import TripData
from app.models.maintenance_security import MaintenanceSecurity
from app.models.child_cab import ChildCab
from app.models.backup_cab import BackupCab
from app.models.spot_rental import SpotRental
from app.models.expenses import Expense
from app.services.vehicle_breakup import calculate_vehicle_breakup, calculate_vehicle_revenue_summary
from app.services.pnl_calculator import calculate_pnl_summary


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def test_vehicle_breakup_uses_taxable_amount(db_session):
    month = "May-2026"
    db_session.add(TripData(vehicle_number="HR55AH7583", ownership="DNP Own", trip_cost=43120, taxable_amount=37950, month=month))
    db_session.add(SpotRental(vehicle_number="HR55AH7583", ownership="DNP Own", without_gst_total_amount=1584, total_billing_items_amount=0, month=month))
    db_session.commit()

    report = calculate_vehicle_breakup(db_session, month)
    row = next(r for r in report["rows"] if r["vehicle_number"] == "HR55AH7583")

    assert row["trip_data_amount"] == 37950  # Taxable Amount, not TripCost
    assert row["spot_rental"] == 1584


def test_vehicle_revenue_summary_uses_trip_cost_and_subtracted_spot_rental(db_session):
    month = "May-2026"
    db_session.add(TripData(vehicle_number="HR55AH7583", ownership="DNP Own", trip_cost=43120, taxable_amount=37950, month=month))
    db_session.add(SpotRental(vehicle_number="HR55AH7583", ownership="DNP Own", without_gst_total_amount=5000, total_billing_items_amount=2000, month=month))
    db_session.commit()

    report = calculate_vehicle_revenue_summary(db_session, month)
    row = next(r for r in report["rows"] if r["vehicle_number"] == "HR55AH7583")

    assert row["trip_data_amount"] == 43120  # gross TripCost, not Taxable Amount
    assert row["spot_rental"] == 3000  # 5000 - 2000


def test_pnl_summary_net_profit(db_session):
    month = "May-2026"
    db_session.add(Expense(month=month, fuel=57281, vehicle_maintenance_cost=20772, drivers_salaries=60000, employee_salary=289100))
    db_session.commit()

    report = calculate_pnl_summary(db_session, month)

    assert report["total_revenue"] == 0.0  # no revenue data uploaded for this month
    assert report["total_expenses"] == 57281 + 20772 + 60000 + 289100
    assert report["net_profit_loss"] == -report["total_expenses"]
