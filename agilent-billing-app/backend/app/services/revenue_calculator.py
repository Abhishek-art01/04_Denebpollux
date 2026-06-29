"""
Computes Report #1 (Detailed Revenue Summary) and Report #2 (Revenue Mix
by Source), per the locked formula spec:

  Total Trip Amount            = SUM(TripData.Taxable Amount)
  Maintenance Charges          = SUM(MaintenanceSecurity.TripCost)
  Creche Duty Charges          = SUM(ChildCab.TripCost)
  Odd Hours Cab Cost           = SUM(BackupCab.TripCost)
  Grand Total (Billable)       = sum of the four above
  Amount Recovered             = manual input (ManualInput.amount_recovered_from_employees)
  Taxable Trip Amount          = Grand Total - Amount Recovered
  Manpower / Technology /
  Dashcam / Razorpay           = AdditionalCharges.Taxable Amt. grouped by keyword category
  Spot Rental Revenue          = SUM(SpotRental.Without GST Total Amount)   [blanks = 0]
  Total Taxable Amount         = Taxable Trip Amount + Manpower + Technology
                                  + Dashcam + Razorpay + Spot Rental Revenue
  CGST / SGST                  = 9% shown for each taxable line item and
                                  on Total Taxable Amount
  Net Amount Payable           = Total Taxable Amount + CGST + SGST
  Total Revenue                = Net Amount Payable + Amount Recovered
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.trip_data import TripData
from app.models.child_cab import ChildCab
from app.models.backup_cab import BackupCab
from app.models.maintenance_security import MaintenanceSecurity
from app.models.spot_rental import SpotRental
from app.models.manual_inputs import ManualInput
from app.services.addl_charges_mapper import get_additional_charges_totals

GST_RATE = 0.09  # 9% CGST + 9% SGST


def _sum_column(db: Session, model, column, month: str) -> float:
    result = db.query(func.coalesce(func.sum(column), 0.0)).filter(model.month == month).scalar()
    return float(result or 0.0)


def _gst_breakup(amount: float) -> dict:
    cgst = amount * GST_RATE
    sgst = amount * GST_RATE
    return {"cgst": cgst, "sgst": sgst, "total": amount + cgst + sgst}


def calculate_revenue_summary(db: Session, month: str) -> dict:
    total_trip_amount = _sum_column(db, TripData, TripData.taxable_amount, month)
    maintenance_charges = _sum_column(db, MaintenanceSecurity, MaintenanceSecurity.trip_cost, month)
    creche_duty_charges = _sum_column(db, ChildCab, ChildCab.trip_cost, month)
    odd_hours_cab_cost = _sum_column(db, BackupCab, BackupCab.trip_cost, month)

    grand_total_billable = (
        total_trip_amount + maintenance_charges + creche_duty_charges + odd_hours_cab_cost
    )

    manual_input = db.query(ManualInput).filter(ManualInput.month == month).first()
    amount_recovered = manual_input.amount_recovered_from_employees if manual_input else 0.0

    taxable_trip_amount = grand_total_billable - amount_recovered

    addl_totals = get_additional_charges_totals(db, month)
    manpower_charges = addl_totals.get("manpower", 0.0)
    technology_cost_recovery = addl_totals.get("technology", 0.0)
    dashcam_subscription_recovery = addl_totals.get("dashcam", 0.0)
    razorpay_fee_recovery = addl_totals.get("razorpay", 0.0)

    spot_rental_revenue = _sum_column(db, SpotRental, SpotRental.without_gst_total_amount, month)

    total_taxable_amount = (
        taxable_trip_amount
        + manpower_charges
        + technology_cost_recovery
        + dashcam_subscription_recovery
        + razorpay_fee_recovery
        + spot_rental_revenue
    )

    taxable_trip_gst = _gst_breakup(taxable_trip_amount)
    manpower_gst = _gst_breakup(manpower_charges)
    technology_gst = _gst_breakup(technology_cost_recovery)
    dashcam_gst = _gst_breakup(dashcam_subscription_recovery)
    razorpay_gst = _gst_breakup(razorpay_fee_recovery)
    spot_rental_gst = _gst_breakup(spot_rental_revenue)

    total_taxable_gst = _gst_breakup(total_taxable_amount)
    cgst_total = total_taxable_gst["cgst"]
    sgst_total = total_taxable_gst["sgst"]
    net_amount_payable_by_agilent = total_taxable_gst["total"]
    total_revenue = net_amount_payable_by_agilent + amount_recovered

    return {
        "month": month,
        "total_trip_amount": total_trip_amount,
        "maintenance_charges": maintenance_charges,
        "creche_duty_charges": creche_duty_charges,
        "odd_hours_cab_cost": odd_hours_cab_cost,
        "grand_total_billable": grand_total_billable,
        "amount_recovered_from_employees": amount_recovered,
        "taxable_trip_amount": taxable_trip_amount,
        "taxable_trip_cgst": taxable_trip_gst["cgst"],
        "taxable_trip_sgst": taxable_trip_gst["sgst"],
        "taxable_trip_total": taxable_trip_gst["total"],
        "manpower_charges": manpower_charges,
        "manpower_cgst": manpower_gst["cgst"],
        "manpower_sgst": manpower_gst["sgst"],
        "manpower_total": manpower_gst["total"],
        "technology_cost_recovery": technology_cost_recovery,
        "technology_cgst": technology_gst["cgst"],
        "technology_sgst": technology_gst["sgst"],
        "technology_total": technology_gst["total"],
        "dashcam_subscription_recovery": dashcam_subscription_recovery,
        "dashcam_cgst": dashcam_gst["cgst"],
        "dashcam_sgst": dashcam_gst["sgst"],
        "dashcam_total": dashcam_gst["total"],
        "razorpay_fee_recovery": razorpay_fee_recovery,
        "razorpay_cgst": razorpay_gst["cgst"],
        "razorpay_sgst": razorpay_gst["sgst"],
        "razorpay_total": razorpay_gst["total"],
        "spot_rental_revenue": spot_rental_revenue,
        "spot_rental_cgst": spot_rental_gst["cgst"],
        "spot_rental_sgst": spot_rental_gst["sgst"],
        "spot_rental_total": spot_rental_gst["total"],
        "total_taxable_amount": total_taxable_amount,
        "cgst_total": cgst_total,
        "sgst_total": sgst_total,
        "net_amount_payable_by_agilent": net_amount_payable_by_agilent,
        "total_revenue": total_revenue,
    }


def calculate_revenue_mix(db: Session, month: str) -> dict:
    """
    Report #2: Revenue Mix by Source - derived directly from Report #1.
    Trip Revenue (Net of Recovery) is shown as Grand Total (Billable),
    matching the sample where "Trip Revenue (Net of Recovery)" = ₹31,18,990
    (the pre-recovery grand total, despite the label - matches sample data).
    """
    summary = calculate_revenue_summary(db, month)
    total_revenue = summary["total_revenue"]

    gst_collected = summary["cgst_total"] + summary["sgst_total"]

    raw_items = [
        ("Trip Revenue (Net of Recovery)", summary["grand_total_billable"]),
        ("Spot Rental Revenue", summary["spot_rental_revenue"]),
        ("Manpower Charges", summary["manpower_charges"]),
        ("Technology Cost Recovery", summary["technology_cost_recovery"]),
        ("Dashcam Subscription Recovery", summary["dashcam_subscription_recovery"]),
        ("Razorpay Fee Recovery", summary["razorpay_fee_recovery"]),
        ("GST Collected (CGST+SGST)", gst_collected),
    ]

    items = []
    for source, amount in raw_items:
        pct = (amount / total_revenue * 100) if total_revenue else 0.0
        items.append({"revenue_source": source, "amount": amount, "percent_of_total": round(pct, 2)})

    return {"month": month, "items": items, "total_revenue": total_revenue}
