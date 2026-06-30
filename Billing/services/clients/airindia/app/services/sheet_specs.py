"""
Concrete SheetSpec definitions for every uploadable sheet, using the
exact header names supplied in the spec. Ownership added to all 4 sheets
per locked decision (user will add this column when uploading).
Entity added to penalty_VehicleWise per locked decision (values: "T-3"
or "AIAA"), so driver penalties can be attributed correctly.
"""
from app.services.excel_parser import SheetSpec
from app.models.trip_data_terminal3 import TripDataTerminal3
from app.models.trip_data_aiaa import TripDataAIAA
from app.models.sundries import Sundries
from app.models.penalty_vehicle_wise import PenaltyVehicleWise


TRIP_DATA_TERMINAL3_SPEC = SheetSpec(
    model=TripDataTerminal3,
    column_map={
        "SR_NO": "sr_no",
        "TRIP_TYPE": "trip_type",
        "STAFF_COUNT": "staff_count",
        "BILL_MAKE": "bill_make",
        "DATE": "date",
        "DUTY_TYPE": "duty_type",
        "DUTY_TYPE2": "duty_type2",
        "UNA": "una",
        "ROUTE_NO": "route_no",
        "TRIP_ID": "trip_id",
        "EMPLOYEE_ID": "employee_id",
        "TEAM_TYPE": "team_type",
        "GENDER": "gender",
        "EMPLOYEE_NAME": "employee_name",
        "EMPLOYEE_ADDRESS": "employee_address",
        "LOCATION": "location",
        "BA_TIME": "ba_time",
        "ETD_TIME": "etd_time",
        "CAB_NO": "cab_no",
        "VEHICLE_NUMBER": "vehicle_number",
        "OWNERSHIP": "ownership",
        "CAB_TYPE": "cab_type",
        "USE_KM": "use_km",
        "CLUBBING_KM": "clubbing_km",
        "TOTAL_KM": "total_km",
        "ONE_SIDE": "one_side",
        "TWO_SIDE": "two_side",
        "CLUB": "club",
        "TOTAL": "total",
        "BB": "bb",
        "PASS_KM": "pass_km",
        "DIFF": "diff",
        "MARSHALL": "marshall",
        "REPORTING": "reporting",
        "VENDOR": "vendor",
        "TOLL_NAME": "toll_name",
        "TOLL_AMOUNT": "toll_amount",
        "TRIP_COST": "trip_cost",
        "TAXABLE_AMOUNT": "taxable_amount",
    },
    numeric_fields=[
        "staff_count", "use_km", "clubbing_km", "total_km", "total", "diff",
        "pass_km", "toll_amount", "trip_cost", "taxable_amount",
    ],
    date_fields=["date"],
    required_fields=["cab_no"],
)

TRIP_DATA_AIAA_SPEC = SheetSpec(
    model=TripDataAIAA,
    column_map={
        "SR_NO": "sr_no",
        "STAFF": "staff",
        "BILL_COUNT": "bill_count",
        "DATE": "date",
        "DUTY_TYPE": "duty_type",
        "UNA": "una",
        "ROUTE_NO": "route_no",
        "TRIP_ID": "trip_id",
        "EMP_ID": "emp_id",
        "TEAM_TYPE": "team_type",
        "GENDER": "gender",
        "EMP_NAME": "emp_name",
        "EMPLOYEE_ADDRESS": "employee_address",
        "LOCATION": "location",
        "PICKUP_TIME": "pickup_time",
        "REPORTING_TIME": "reporting_time",
        "VENDOR": "vendor",
        "CAB_NO": "cab_no",
        "VEHICLE_NUMBER": "vehicle_number",
        "CAB_TYPE": "cab_type",
        "USE_ZONE_KM": "use_zone_km",
        "CLAIM": "claim",
        "PASS_ZONE": "pass_zone",
        "PASS_AMOUNT": "pass_amount",
        "GUARD_COST": "guard_cost",
        "GUARD": "guard",
        "REPORING_AREA": "reporting_area",
        "BILL_AT": "bill_at",
        "TRG_TYPE": "trg_type",
        "TOLL_NAME": "toll_name",
        "TOLL_AMOUNT": "toll_amount",
        "TRIP_COST": "trip_cost",
        "TAXABLE_AMOUNT": "taxable_amount",
    },
    numeric_fields=[
        "staff", "bill_count", "claim", "pass_amount",
        "guard_cost", "toll_amount", "trip_cost", "taxable_amount", "total",
    ],
    date_fields=["date"],
    required_fields=["una", "cab_no"],
)

SUNDRIES_SPEC = SheetSpec(
    model=Sundries,
    column_map={
        "Vehicle No.": "vehicle_no",
        "VEH. NO.": "veh_no",
        "VEH. TYPE": "veh_type",
        "Ownership": "ownership",
        "MCD": "mcd",
        "No. of working Days": "no_of_working_days",
    },
    numeric_fields=["mcd", "no_of_working_days"],
    required_fields=["vehicle_no"],
)

PENALTY_VEHICLE_WISE_SPEC = SheetSpec(
    model=PenaltyVehicleWise,
    column_map={
        "vehicleNO": "vehicle_no",
        "Amount": "amount",
        "Remark": "remark",
        "Entity": "entity",
        "Ownership": "ownership",
    },
    numeric_fields=["amount"],
    required_fields=["vehicle_no"],
)
