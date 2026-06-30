"""
Computes Report #2 (Vehicle Revenue Summary) for Air India, per the
locked formula spec:

  T-3Amount   = SUM(TripDataTerminal3.trip_cost) for vehicle
                - SUM(PenaltyVehicleWise.amount WHERE entity = "T-3") for vehicle
  AIAAamount  = SUM(TripDataAIAA.trip_cost) for vehicle
                - SUM(PenaltyVehicleWise.amount WHERE entity = "AIAA") for vehicle
  Total       = T-3Amount + AIAAamount

Ownership: taken from whichever of the 4 sheets (T-3, AIAA, Sundries,
PenaltyVehicleWise) has a non-null Ownership value for that vehicle first.

Vehtype ("Cab Type"): if a vehicle appears in BOTH Trip_Data_TERMINAL-3 and
Trip_Data_AIAA with different Cab Type values, T-3's Cab Type always wins
(per locked decision). Falls back to AIAA's Cab Type if T-3 has none.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.trip_data_terminal3 import TripDataTerminal3
from app.models.trip_data_aiaa import TripDataAIAA
from app.models.penalty_vehicle_wise import PenaltyVehicleWise
from app.models.sundries import Sundries


def _grouped_sum(db: Session, model, amount_column, key_col, month: str, extra_filter=None) -> dict[str, float]:
    query = db.query(key_col, func.coalesce(func.sum(amount_column), 0.0)).filter(model.month == month)
    if extra_filter is not None:
        query = query.filter(extra_filter)
    rows = query.group_by(key_col).all()
    return {vehicle: float(amount or 0.0) for vehicle, amount in rows}


def _first_non_null_map(db: Session, model, key_attr, value_attr, month: str) -> dict[str, str]:
    rows = db.query(getattr(model, key_attr), getattr(model, value_attr)).filter(model.month == month).all()
    result = {}
    for key, value in rows:
        if key and key not in result and value:
            result[key] = value
    return result


def calculate_vehicle_revenue_summary(db: Session, month: str) -> dict:
    t3_trip = _grouped_sum(db, TripDataTerminal3, TripDataTerminal3.trip_cost, TripDataTerminal3.cab_no, month)
    aiaa_trip = _grouped_sum(db, TripDataAIAA, TripDataAIAA.trip_cost, TripDataAIAA.cab_no, month)

    t3_penalty = _grouped_sum(
        db, PenaltyVehicleWise, PenaltyVehicleWise.amount, PenaltyVehicleWise.vehicle_no, month,
        extra_filter=(PenaltyVehicleWise.entity == "T-3"),
    )
    aiaa_penalty = _grouped_sum(
        db, PenaltyVehicleWise, PenaltyVehicleWise.amount, PenaltyVehicleWise.vehicle_no, month,
        extra_filter=(PenaltyVehicleWise.entity == "AIAA"),
    )

    # Ownership: first non-null across T-3, AIAA, Sundries, PenaltyVehicleWise (in that priority order)
    ownership_map: dict[str, str] = {}
    for model, key_attr in [
        (TripDataTerminal3, "cab_no"), (TripDataAIAA, "cab_no"),
        (Sundries, "vehicle_no"), (PenaltyVehicleWise, "vehicle_no"),
    ]:
        new_map = _first_non_null_map(db, model, key_attr, "ownership", month)
        for k, v in new_map.items():
            if k not in ownership_map:
                ownership_map[k] = v

    # Vehtype (Cab Type): T-3 wins if both exist, per locked decision
    cab_type_t3 = _first_non_null_map(db, TripDataTerminal3, "cab_no", "cab_type", month)
    cab_type_aiaa = _first_non_null_map(db, TripDataAIAA, "cab_no", "cab_type", month)
    cab_type_map: dict[str, str] = dict(cab_type_aiaa)  # start with AIAA, then overwrite with T-3
    cab_type_map.update(cab_type_t3)  # T-3 wins on conflict

    all_vehicles = set(t3_trip) | set(aiaa_trip) | set(t3_penalty) | set(aiaa_penalty)

    rows = []
    grand_total_t3 = 0.0
    grand_total_aiaa = 0.0
    grand_total_overall = 0.0

    for vehicle in sorted(all_vehicles):
        t3_amount = t3_trip.get(vehicle, 0.0) - t3_penalty.get(vehicle, 0.0)
        aiaa_amount = aiaa_trip.get(vehicle, 0.0) - aiaa_penalty.get(vehicle, 0.0)
        total = t3_amount + aiaa_amount

        rows.append({
            "vehicle_number": vehicle,
            "ownership": ownership_map.get(vehicle, "Other"),
            "veh_type": cab_type_map.get(vehicle, ""),
            "t3_amount": t3_amount,
            "aiaa_amount": aiaa_amount,
            "total": total,
        })

        grand_total_t3 += t3_amount
        grand_total_aiaa += aiaa_amount
        grand_total_overall += total

    return {
        "month": month,
        "rows": rows,
        "grand_total_t3": grand_total_t3,
        "grand_total_aiaa": grand_total_aiaa,
        "grand_total_overall": grand_total_overall,
    }
