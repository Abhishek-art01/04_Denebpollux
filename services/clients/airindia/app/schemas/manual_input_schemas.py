from pydantic import BaseModel


class ManualInputIn(BaseModel):
    employee_penalty_t3: float = 0.0
    employee_penalty_aiaa: float = 0.0


class ManualInputOut(ManualInputIn):
    month: str

    class Config:
        from_attributes = True


class ExpenseIn(BaseModel):
    fuel: float = 0.0
    vehicle_maintenance_cost: float = 0.0
    drivers_salaries: float = 0.0
    vehicle_emi: float = 0.0
    razorpay_transaction_fee: float = 0.0
    vendor_payment: float = 0.0
    employee_salary: float = 0.0
    gst: float = 0.0


class ExpenseOut(ExpenseIn):
    month: str

    class Config:
        from_attributes = True
