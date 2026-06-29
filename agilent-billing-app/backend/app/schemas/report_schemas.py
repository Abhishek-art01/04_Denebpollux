"""
Response schemas for each of the 6 dashboard reports. Field names follow
the exact report layouts agreed in the spec so the frontend can render
tables directly off these shapes with minimal transformation.
"""
from typing import List, Optional
from pydantic import BaseModel


# ---------- Report #1: Detailed Revenue Summary ----------

class RevenueLineItem(BaseModel):
    particulars: str
    amount: float
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    total: Optional[float] = None


class RevenueSummaryReport(BaseModel):
    month: str
    total_trip_amount: float
    maintenance_charges: float
    creche_duty_charges: float
    odd_hours_cab_cost: float
    grand_total_billable: float
    amount_recovered_from_employees: float
    taxable_trip_amount: float
    taxable_trip_cgst: float
    taxable_trip_sgst: float
    taxable_trip_total: float
    manpower_charges: float
    manpower_cgst: float
    manpower_sgst: float
    manpower_total: float
    technology_cost_recovery: float
    technology_cgst: float
    technology_sgst: float
    technology_total: float
    dashcam_subscription_recovery: float
    dashcam_cgst: float
    dashcam_sgst: float
    dashcam_total: float
    razorpay_fee_recovery: float
    razorpay_cgst: float
    razorpay_sgst: float
    razorpay_total: float
    spot_rental_revenue: float
    spot_rental_cgst: float
    spot_rental_sgst: float
    spot_rental_total: float
    total_taxable_amount: float
    cgst_total: float
    sgst_total: float
    net_amount_payable_by_agilent: float
    total_revenue: float


# ---------- Report #2: Revenue Mix by Source ----------

class RevenueMixItem(BaseModel):
    revenue_source: str
    amount: float
    percent_of_total: float


class RevenueMixReport(BaseModel):
    month: str
    items: List[RevenueMixItem]
    total_revenue: float


# ---------- Report #3: Vehicle-wise Revenue Breakup ----------

class VehicleBreakupRow(BaseModel):
    vehicle_number: str
    ownership: str
    trip_data_amount: float
    spot_rental: float
    maintenance_veh_amount: float
    child_cab_amount: float
    backup_cabs_amount: float
    grand_total: float
    percent_of_total: float


class VehicleBreakupReport(BaseModel):
    month: str
    rows: List[VehicleBreakupRow]
    grand_total_trip_data: float
    grand_total_spot_rental: float
    grand_total_maintenance: float
    grand_total_child_cab: float
    grand_total_backup_cab: float
    grand_total_overall: float


# ---------- Report #4: Revenue by Ownership Type ----------

class OwnershipBreakupRow(BaseModel):
    ownership_type: str
    total_revenue: float
    percent_of_total: float


class OwnershipBreakupReport(BaseModel):
    month: str
    rows: List[OwnershipBreakupRow]
    total: float


# ---------- Report #5: Vehicle Revenue Summary (Spot Rental, toll/parking/tax logic differs) ----------

class VehicleRevenueSummaryRow(BaseModel):
    vehicle_number: str
    ownership: str
    trip_data_amount: float
    spot_rental: float
    maintenance_veh_amount: float
    child_cab_amount: float
    backup_cabs_amount: float
    grand_total: float


class VehicleRevenueSummaryReport(BaseModel):
    month: str
    rows: List[VehicleRevenueSummaryRow]
    grand_total_trip_data: float
    grand_total_spot_rental: float
    grand_total_maintenance: float
    grand_total_child_cab: float
    grand_total_backup_cab: float
    grand_total_overall: float


# ---------- Report #6: PNL / MIS Summary ----------

class PnlLineItem(BaseModel):
    particulars: str
    amount: float
    percent_of_sale: float
    notes: Optional[str] = None


class PnlSummaryReport(BaseModel):
    month: str
    total_revenue: float
    expenses: List[PnlLineItem]
    total_expenses: float
    net_profit_loss: float
    net_margin_percent: float
