"""
Report #6: PNL / MIS Summary.
Total Revenue is pulled from Report #1 (Detailed Revenue Summary).
Expenses are entirely manual monthly inputs (Fuel, Vehicle Maintenance
Cost, Drivers Salaries, Vehicle EMI, Vendor Payment, GST, Employee Salary).
Net Profit/Loss = Total Revenue - Total Expenses.
"""
from sqlalchemy.orm import Session

from app.models.expenses import Expense
from app.services.revenue_calculator import calculate_revenue_summary

EXPENSE_LABELS = [
    ("fuel", "Fuel"),
    ("vehicle_maintenance_cost", "VehicleMaintainenceCost"),
    ("drivers_salaries", "DriversSalaries"),
    ("vehicle_emi", "VehicleEMI"),
    ("vendor_payment", "VenderPayment"),
    ("gst", "GST"),
    ("employee_salary", "EmployeeSalary"),
]


def calculate_pnl_summary(db: Session, month: str) -> dict:
    revenue_summary = calculate_revenue_summary(db, month)
    total_revenue = revenue_summary["total_revenue"]

    expense_row = db.query(Expense).filter(Expense.month == month).first()

    expenses = []
    total_expenses = 0.0
    for attr, label in EXPENSE_LABELS:
        amount = getattr(expense_row, attr, 0.0) if expense_row else 0.0
        amount = amount or 0.0
        pct = (amount / total_revenue * 100) if total_revenue else 0.0
        expenses.append({
            "particulars": label,
            "amount": amount,
            "percent_of_sale": round(pct, 2),
        })
        total_expenses += amount

    net_profit_loss = total_revenue - total_expenses
    net_margin_percent = (net_profit_loss / total_revenue * 100) if total_revenue else 0.0

    return {
        "month": month,
        "total_revenue": total_revenue,
        "expenses": expenses,
        "total_expenses": total_expenses,
        "net_profit_loss": net_profit_loss,
        "net_margin_percent": round(net_margin_percent, 2),
    }
