"""
Response schemas for the 3 Air India dashboard reports.
"""
from typing import List, Optional
from pydantic import BaseModel


# ---------- Report #1: Detailed Revenue Summary ----------

class RevenueSummaryReport(BaseModel):
    month: str

    trip_amount_t3: float
    toll_amount_t3: float
    mcd: float
    t3_driver_penalty: float
    t3_employee_penalty: float
    total_of_terminal3: float

    trip_amount_aiaa: float
    toll_amount_aiaa: float
    aiaa_driver_penalty: float
    aiaa_employee_penalty: float
    total_of_aiaa: float

    total_taxable_amount: float
    gst_t3: float
    gst_aiaa: float
    gst_total: float
    total_revenue: float


# ---------- Report #2: Vehicle Revenue Summary ----------

class VehicleRevenueSummaryRow(BaseModel):
    vehicle_number: str
    ownership: str
    veh_type: str
    t3_amount: float       # SUM(Trip_Data_TERMINAL-3.TripCost) - SUM(penalty for this vehicle, Entity=T-3)
    aiaa_amount: float     # SUM(Trip_Data_AIAA.TripCost) - SUM(penalty for this vehicle, Entity=AIAA)
    total: float


class VehicleRevenueSummaryReport(BaseModel):
    month: str
    rows: List[VehicleRevenueSummaryRow]
    grand_total_t3: float
    grand_total_aiaa: float
    grand_total_overall: float


# ---------- Report #3: PNL / MIS Summary ----------

class PnlLineItem(BaseModel):
    particulars: str
    amount: float
    percent_of_sale: float
    notes: Optional[str] = None


class PnlSummaryReport(BaseModel):
    month: str
    total_revenue: float

    # Vehicle Operating Costs (Own Vehicles)
    fuel: PnlLineItem
    vehicle_maintenance_cost: PnlLineItem
    drivers_salaries: PnlLineItem
    vehicle_emi: PnlLineItem

    # Technology & Software
    razorpay_transaction_fee: PnlLineItem

    # Operational Expenses
    mcd_state_taxes_toll_parking: PnlLineItem  # auto-calculated
    vendor_payment: PnlLineItem
    employee_salary: PnlLineItem

    # Taxes
    gst: PnlLineItem

    total_expenses: float
    net_profit_loss: float
    net_margin_percent: float
