from pydantic import BaseModel


class ManualInputIn(BaseModel):
    amount_recovered_from_employees: float = 0.0


class ManualInputOut(BaseModel):
    month: str
    amount_recovered_from_employees: float

    class Config:
        from_attributes = True


class ExpenseIn(BaseModel):
    fuel: float = 0.0
    vehicle_maintenance_cost: float = 0.0
    drivers_salaries: float = 0.0
    vehicle_emi: float = 0.0
    vendor_payment: float = 0.0
    gst: float = 0.0
    employee_salary: float = 0.0


class ExpenseOut(ExpenseIn):
    month: str

    class Config:
        from_attributes = True


class ChargeCategoryMappingIn(BaseModel):
    keyword: str
    category: str  # manpower | technology | dashcam | razorpay | other


class ChargeCategoryMappingOut(ChargeCategoryMappingIn):
    id: int

    class Config:
        from_attributes = True
