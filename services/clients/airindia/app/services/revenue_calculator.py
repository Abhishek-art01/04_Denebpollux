"""
Computes Report #1 (Detailed Revenue Summary) for Air India, per the
locked formula spec:

  Trip_Amount_T3      = SUM(TripDataTerminal3.trip_cost)
  TollAmount_T3       = SUM(TripDataTerminal3.toll_amount)
  MCD                 = SUM(Sundries.mcd)                         [T-3 only, single shared line]
  T3 Driver Penalty   = SUM(PenaltyVehicleWise.amount WHERE entity = "T-3")
  T3 Employee Penalty = manual monthly input
  Total Of Terminal3  = Trip_Amount_T3 + TollAmount_T3 + MCD
                          - T3 Driver Penalty - T3 Employee Penalty

  Trip_Amount_AIAA      = SUM(TripDataAIAA.trip_cost)
  TollAmount_AIAA       = SUM(TripDataAIAA.toll_amount)
  AIAA Driver Penalty   = SUM(PenaltyVehicleWise.amount WHERE entity = "AIAA")
  AIAA Employee Penalty = manual monthly input
  Total of AIAA         = Trip_Amount_AIAA + TollAmount_AIAA
                            - AIAA Driver Penalty - AIAA Employee Penalty

  Total Taxable Amount = Total Of Terminal3 + Total of AIAA
  GST (T-3)             = Total Of Terminal3 * 5%
  GST (AIAA)            = Total of AIAA * 5%
  GST (total)           = GST(T-3) + GST(AIAA)
  TOTAL REVENUE          = Total Taxable Amount + GST(total)
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.trip_data_terminal3 import TripDataTerminal3
from app.models.trip_data_aiaa import TripDataAIAA
from app.models.sundries import Sundries
from app.models.penalty_vehicle_wise import PenaltyVehicleWise
from app.models.manual_inputs import ManualInput

GST_RATE = 0.05  # 5%, calculated separately per entity then summed


def _sum_column(db: Session, model, column, month: str, extra_filter=None) -> float:
    query = db.query(func.coalesce(func.sum(column), 0.0)).filter(model.month == month)
    if extra_filter is not None:
        query = query.filter(extra_filter)
    result = query.scalar()
    return float(result or 0.0)


def calculate_revenue_summary(db: Session, month: str) -> dict:
    trip_amount_t3 = _sum_column(db, TripDataTerminal3, TripDataTerminal3.trip_cost, month)
    toll_amount_t3 = _sum_column(db, TripDataTerminal3, TripDataTerminal3.toll_amount, month)
    mcd = _sum_column(db, Sundries, Sundries.mcd, month)

    t3_driver_penalty = _sum_column(
        db, PenaltyVehicleWise, PenaltyVehicleWise.amount, month,
        extra_filter=(PenaltyVehicleWise.entity == "T-3"),
    )

    manual_input = db.query(ManualInput).filter(ManualInput.month == month).first()
    t3_employee_penalty = manual_input.employee_penalty_t3 if manual_input else 0.0
    aiaa_employee_penalty = manual_input.employee_penalty_aiaa if manual_input else 0.0

    total_of_terminal3 = (
        trip_amount_t3 + toll_amount_t3 + mcd - t3_driver_penalty - t3_employee_penalty
    )

    trip_amount_aiaa = _sum_column(db, TripDataAIAA, TripDataAIAA.trip_cost, month)
    toll_amount_aiaa = _sum_column(db, TripDataAIAA, TripDataAIAA.toll_amount, month)

    aiaa_driver_penalty = _sum_column(
        db, PenaltyVehicleWise, PenaltyVehicleWise.amount, month,
        extra_filter=(PenaltyVehicleWise.entity == "AIAA"),
    )

    total_of_aiaa = (
        trip_amount_aiaa + toll_amount_aiaa - aiaa_driver_penalty - aiaa_employee_penalty
    )

    total_taxable_amount = total_of_terminal3 + total_of_aiaa

    gst_t3 = total_of_terminal3 * GST_RATE
    gst_aiaa = total_of_aiaa * GST_RATE
    gst_total = gst_t3 + gst_aiaa

    total_revenue = total_taxable_amount + gst_total

    return {
        "month": month,
        "trip_amount_t3": trip_amount_t3,
        "toll_amount_t3": toll_amount_t3,
        "mcd": mcd,
        "t3_driver_penalty": t3_driver_penalty,
        "t3_employee_penalty": t3_employee_penalty,
        "total_of_terminal3": total_of_terminal3,
        "trip_amount_aiaa": trip_amount_aiaa,
        "toll_amount_aiaa": toll_amount_aiaa,
        "aiaa_driver_penalty": aiaa_driver_penalty,
        "aiaa_employee_penalty": aiaa_employee_penalty,
        "total_of_aiaa": total_of_aiaa,
        "total_taxable_amount": total_taxable_amount,
        "gst_t3": gst_t3,
        "gst_aiaa": gst_aiaa,
        "gst_total": gst_total,
        "total_revenue": total_revenue,
    }
