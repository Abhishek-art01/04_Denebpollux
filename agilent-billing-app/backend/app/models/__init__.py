"""
Importing every model here ensures Base.metadata.create_all() picks up
all tables when called from main.py / alembic env.py.
"""
from app.models.trip_data import TripData
from app.models.child_cab import ChildCab
from app.models.backup_cab import BackupCab
from app.models.maintenance_security import MaintenanceSecurity
from app.models.spot_rental import SpotRental
from app.models.additional_charges import AdditionalCharges
from app.models.manual_inputs import ManualInput
from app.models.expenses import Expense
from app.models.charge_category_mapping import ChargeCategoryMapping

__all__ = [
    "TripData",
    "ChildCab",
    "BackupCab",
    "MaintenanceSecurity",
    "SpotRental",
    "AdditionalCharges",
    "ManualInput",
    "Expense",
    "ChargeCategoryMapping",
]
