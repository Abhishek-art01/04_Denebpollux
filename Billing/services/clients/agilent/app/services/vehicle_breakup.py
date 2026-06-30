"""
Computes Report #3 (Vehicle-wise Revenue Breakup) and Report #5
(Vehicle Revenue Summary), per the locked formula spec:

Report #3 (includes Spot Rental):
  TripDataAmount      = SUM(TripData.Taxable Amount)        grouped by vehicle
  SpotRentel          = SUM(SpotRental.Without GST Total Amount)  grouped by vehicle
  MaintainenceVehAmt  = SUM(MaintenanceSecurity.TripCost)    grouped by vehicle
  ChildCabAmount      = SUM(ChildCab.TripCost)               grouped by vehicle
  BackupCabsAmount    = SUM(BackupCab.TripCost)               grouped by vehicle
  GrandTotal          = sum of the five above

Report #5 (Vehicle Revenue Summary):
  TripDataAmount      = SUM(TripData.TripCost)  [gross, not Taxable Amount]
  SpotRentel          = SUM(SpotRental.Without GST Total Amount)
                          - SUM(SpotRental.Total Billing Items Amount)
                          [each summed independently, blanks = 0, then subtracted]
  MaintainenceVehAmt  = SUM(MaintenanceSecurity.TripCost)
  ChildCabAmount      = SUM(ChildCab.TripCost)
  BackupCabsAmount    = SUM(BackupCab.TripCost)
  GrandTotal          = sum of the five above

Ownership is taken from TripData where available, falling back to
whichever source sheet has a row for that vehicle (since ownership
should be consistent per vehicle across sheets).
"""
from collections import defaultdict

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.trip_data import TripData
from app.models.child_cab import ChildCab
from app.models.backup_cab import BackupCab
from app.models.maintenance_security import MaintenanceSecurity
from app.models.spot_rental import SpotRental


def _grouped_sum(db: Session, model, amount_column, month: str) -> dict[str, float]:
    """Returns {vehicle_number: summed_amount} for a given model/column/month."""
    rows = (
        db.query(model.vehicle_number, func.coalesce(func.sum(amount_column), 0.0))
        .filter(model.month == month)
        .group_by(model.vehicle_number)
        .all()
    )
    return {vehicle: float(amount or 0.0) for vehicle, amount in rows}


def _grouped_ownership(db: Session, model, month: str) -> dict[str, str]:
    """Returns {vehicle_number: ownership} - takes the first non-null ownership seen."""
    rows = (
        db.query(model.vehicle_number, model.ownership)
        .filter(model.month == month)
        .all()
    )
    result = {}
    for vehicle, ownership in rows:
        if vehicle and vehicle not in result and ownership:
            result[vehicle] = ownership
    return result


def _build_vehicle_rows(
    db: Session,
    month: str,
    trip_data_column,
    include_percent: bool,
) -> tuple[list[dict], dict]:
    """
    Shared logic for Reports #3 and #5: groups all five sources by vehicle
    number, merges them, and computes per-vehicle grand totals.
    """
    trip_amounts = _grouped_sum(db, TripData, trip_data_column, month)
    maint_amounts = _grouped_sum(db, MaintenanceSecurity, MaintenanceSecurity.trip_cost, month)
    child_amounts = _grouped_sum(db, ChildCab, ChildCab.trip_cost, month)
    backup_amounts = _grouped_sum(db, BackupCab, BackupCab.trip_cost, month)

    spot_without_gst = _grouped_sum(db, SpotRental, SpotRental.without_gst_total_amount, month)

    ownership_map = {}
    for model in (TripData, MaintenanceSecurity, ChildCab, BackupCab, SpotRental):
        ownership_map.update(
            {k: v for k, v in _grouped_ownership(db, model, month).items() if k not in ownership_map}
        )

    all_vehicles = set(trip_amounts) | set(maint_amounts) | set(child_amounts) | set(backup_amounts) | set(spot_without_gst)

    rows = []
    totals = {
        "trip_data": 0.0, "spot_rental": 0.0, "maintenance": 0.0,
        "child_cab": 0.0, "backup_cab": 0.0, "overall": 0.0,
    }

    for vehicle in sorted(all_vehicles):
        trip_amt = trip_amounts.get(vehicle, 0.0)
        maint_amt = maint_amounts.get(vehicle, 0.0)
        child_amt = child_amounts.get(vehicle, 0.0)
        backup_amt = backup_amounts.get(vehicle, 0.0)
        spot_amt = spot_without_gst.get(vehicle, 0.0)

        grand_total = trip_amt + spot_amt + maint_amt + child_amt + backup_amt

        rows.append({
            "vehicle_number": vehicle,
            "ownership": ownership_map.get(vehicle, "Other"),
            "trip_data_amount": trip_amt,
            "spot_rental": spot_amt,
            "maintenance_veh_amount": maint_amt,
            "child_cab_amount": child_amt,
            "backup_cabs_amount": backup_amt,
            "grand_total": grand_total,
        })

        totals["trip_data"] += trip_amt
        totals["spot_rental"] += spot_amt
        totals["maintenance"] += maint_amt
        totals["child_cab"] += child_amt
        totals["backup_cab"] += backup_amt
        totals["overall"] += grand_total

    if include_percent:
        for row in rows:
            row["percent_of_total"] = (
                round(row["grand_total"] / totals["overall"] * 100, 2) if totals["overall"] else 0.0
            )

    return rows, totals


def calculate_vehicle_breakup(db: Session, month: str) -> dict:
    """Report #3: Vehicle-wise Revenue Breakup (Spot Rental included, TripData.Taxable Amount)."""
    rows, totals = _build_vehicle_rows(
        db, month, trip_data_column=TripData.taxable_amount, include_percent=True
    )
    return {
        "month": month,
        "rows": rows,
        "grand_total_trip_data": totals["trip_data"],
        "grand_total_spot_rental": totals["spot_rental"],
        "grand_total_maintenance": totals["maintenance"],
        "grand_total_child_cab": totals["child_cab"],
        "grand_total_backup_cab": totals["backup_cab"],
        "grand_total_overall": totals["overall"],
    }


def calculate_vehicle_revenue_summary(db: Session, month: str) -> dict:
    """
    Report #5: Vehicle Revenue Summary (TripData.TripCost gross; SpotRentel
    uses Without GST Total Amount MINUS Total Billing Items Amount, each
    summed independently across all rows for the month before subtracting).
    """
    rows, totals = _build_vehicle_rows(
        db, month, trip_data_column=TripData.trip_cost, include_percent=False
    )

    # Override spot_rental figures with the #5-specific subtraction formula.
    # Compute month-level totals for both SpotRental columns (not per-vehicle,
    # since the subtraction is defined at the aggregate level per the locked spec).
    total_without_gst = db.query(
        func.coalesce(func.sum(SpotRental.without_gst_total_amount), 0.0)
    ).filter(SpotRental.month == month).scalar() or 0.0

    total_billing_items = db.query(
        func.coalesce(func.sum(SpotRental.total_billing_items_amount), 0.0)
    ).filter(SpotRental.month == month).scalar() or 0.0

    aggregate_spot_rental = float(total_without_gst) - float(total_billing_items)

    # Per-vehicle SpotRental breakdown for #5, using the same per-vehicle
    # subtraction (each column grouped/summed independently, then subtracted),
    # consistent with "sum each column separately, then subtract" at any
    # level of aggregation.
    spot_without_gst_by_vehicle = _grouped_sum(db, SpotRental, SpotRental.without_gst_total_amount, month)
    spot_billing_items_by_vehicle = _grouped_sum(db, SpotRental, SpotRental.total_billing_items_amount, month)
    all_spot_vehicles = set(spot_without_gst_by_vehicle) | set(spot_billing_items_by_vehicle)

    spot_rental_by_vehicle = {
        v: spot_without_gst_by_vehicle.get(v, 0.0) - spot_billing_items_by_vehicle.get(v, 0.0)
        for v in all_spot_vehicles
    }

    # Re-merge rows with corrected spot_rental + grand_total, and add any
    # vehicles that only appear in spot rental subtraction data.
    rows_by_vehicle = {r["vehicle_number"]: r for r in rows}
    for vehicle in all_spot_vehicles:
        if vehicle not in rows_by_vehicle:
            rows_by_vehicle[vehicle] = {
                "vehicle_number": vehicle,
                "ownership": "Other",
                "trip_data_amount": 0.0,
                "spot_rental": 0.0,
                "maintenance_veh_amount": 0.0,
                "child_cab_amount": 0.0,
                "backup_cabs_amount": 0.0,
                "grand_total": 0.0,
            }
            rows.append(rows_by_vehicle[vehicle])

    recalculated_total = 0.0
    for row in rows:
        vehicle = row["vehicle_number"]
        row["spot_rental"] = spot_rental_by_vehicle.get(vehicle, 0.0)
        row["grand_total"] = (
            row["trip_data_amount"] + row["spot_rental"] + row["maintenance_veh_amount"]
            + row["child_cab_amount"] + row["backup_cabs_amount"]
        )
        recalculated_total += row["grand_total"]

    return {
        "month": month,
        "rows": rows,
        "grand_total_trip_data": totals["trip_data"],
        "grand_total_spot_rental": aggregate_spot_rental,
        "grand_total_maintenance": totals["maintenance"],
        "grand_total_child_cab": totals["child_cab"],
        "grand_total_backup_cab": totals["backup_cab"],
        "grand_total_overall": recalculated_total,
    }
