"""
Importing every model here ensures Base.metadata.create_all() picks up
all tables when called from main.py.
"""
from app.models.trip_data_terminal3 import TripDataTerminal3
from app.models.trip_data_aiaa import TripDataAIAA
from app.models.sundries import Sundries
from app.models.penalty_vehicle_wise import PenaltyVehicleWise
from app.models.manual_inputs import ManualInput
from app.models.expenses import Expense

__all__ = [
    "TripDataTerminal3",
    "TripDataAIAA",
    "Sundries",
    "PenaltyVehicleWise",
    "ManualInput",
    "Expense",
]
