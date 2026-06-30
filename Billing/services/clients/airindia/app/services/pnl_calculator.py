"""
Report #3: PNL / MIS Summary for Air India.
Total Revenue is pulled from Report #1 (Detailed Revenue Summary).
Most expense lines are manual monthly inputs, EXCEPT:
  "MCD/State Taxs/Toll And Parking" = SUNDRIES.MCD + TollAmount_T3 + TollAmount_AIAA
  (auto-calculated, per locked spec - NOT manual)
Net Profit/Loss = Total Revenue - Total Expenses.
"""
from sqlalchemy.orm import Session

from app.models.expenses import Expense
from app.services.revenue_calculator import calculate_revenue_summary


def _line_item(particulars: str, amount: float, total_revenue: float) -> dict:
    pct = (amount / total_revenue * 100) if total_revenue else 0.0
    return {"particulars": particulars, "amount": amount, "percent_of_sale": round(pct, 2)}


def calculate_pnl_summary(db: Session, month: str) -> dict:
    revenue_summary = calculate_revenue_summary(db, month)
    total_revenue = revenue_summary["total_revenue"]

    expense_row = db.query(Expense).filter(Expense.month == month).first()

    def get(attr):
        return (getattr(expense_row, attr, 0.0) if expense_row else 0.0) or 0.0

    # Auto-calculated line: MCD/State Taxes/Toll And Parking
    mcd_state_taxes_toll_parking_amount = (
        revenue_summary["mcd"] + revenue_summary["toll_amount_t3"] + revenue_summary["toll_amount_aiaa"]
    )

    fuel = _line_item("Fuel", get("fuel"), total_revenue)
    vehicle_maintenance_cost = _line_item("VehicleMaintainenceCost", get("vehicle_maintenance_cost"), total_revenue)
    drivers_salaries = _line_item("DriversSalaries", get("drivers_salaries"), total_revenue)
    vehicle_emi = _line_item("VehicleEMI", get("vehicle_emi"), total_revenue)
    razorpay_transaction_fee = _line_item("Razorpay Transaction Fee", get("razorpay_transaction_fee"), total_revenue)
    mcd_state_taxes_toll_parking = _line_item(
        "MCD/State Taxs/Toll And Parking", mcd_state_taxes_toll_parking_amount, total_revenue
    )
    vendor_payment = _line_item("VenderPayment", get("vendor_payment"), total_revenue)
    employee_salary = _line_item("EmployeeSalary", get("employee_salary"), total_revenue)
    gst = _line_item("GST", get("gst"), total_revenue)

    total_expenses = (
        fuel["amount"] + vehicle_maintenance_cost["amount"] + drivers_salaries["amount"]
        + vehicle_emi["amount"] + razorpay_transaction_fee["amount"]
        + mcd_state_taxes_toll_parking["amount"] + vendor_payment["amount"]
        + employee_salary["amount"] + gst["amount"]
    )

    net_profit_loss = total_revenue - total_expenses
    net_margin_percent = (net_profit_loss / total_revenue * 100) if total_revenue else 0.0

    return {
        "month": month,
        "total_revenue": total_revenue,
        "fuel": fuel,
        "vehicle_maintenance_cost": vehicle_maintenance_cost,
        "drivers_salaries": drivers_salaries,
        "vehicle_emi": vehicle_emi,
        "razorpay_transaction_fee": razorpay_transaction_fee,
        "mcd_state_taxes_toll_parking": mcd_state_taxes_toll_parking,
        "vendor_payment": vendor_payment,
        "employee_salary": employee_salary,
        "gst": gst,
        "total_expenses": total_expenses,
        "net_profit_loss": net_profit_loss,
        "net_margin_percent": round(net_margin_percent, 2),
    }
