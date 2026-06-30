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
        "S.NO": "s_no",
        "TripType": "trip_type",
        "STAFF COUNT": "staff_count",
        "BILL MAKE": "bill_make",
        "DATE": "date",
        "DUTY TYPE": "duty_type",
        "DUTY TYPE2": "duty_type2",
        "UNA": "una",
        "RouteNo": "route_no",
        "Trip ID": "trip_id",
        "Employee ID": "employee_id",
        "Team Type": "team_type",
        "Gender": "gender",
        "Employee Name": "employee_name",
        "Address": "address",
        "BA TIME": "ba_time",
        "ETD TIME": "etd_time",
        "CabNo.": "cab_no",
        "CabNo.2": "cab_no_2",
        "Cab Type": "cab_type",
        "Ownership": "ownership",
        "USE KM": "use_km",
        "CLUBBING KM": "clubbing_km",
        "Total KM": "total_km",
        "ONE SIDE": "one_side",
        "TWO SIDE": "two_side",
        "CLUB": "club",
        "BB": "bb",
        "TOTAL": "total",
        "DIFF.": "diff",
        "MARSHALL": "marshall",
        "REPORTING @": "reporting_at",
        "Vendor": "vendor",
        "TOLL NAME": "toll_name",
        "TollAmount": "toll_amount",
        "TripCost": "trip_cost",
        "TaxableAmount": "taxable_amount",
    },
    numeric_fields=[
        "staff_count", "use_km", "clubbing_km", "total_km", "total", "diff",
        "toll_amount", "trip_cost", "taxable_amount",
    ],
    date_fields=["date"],
    required_fields=["cab_no"],
)

TRIP_DATA_AIAA_SPEC = SheetSpec(
    model=TripDataAIAA,
    column_map={
        "SR NO": "sr_no",
        "STAFF": "staff",
        "BILL COUNT": "bill_count",
        "Date": "date",
        "DUTY TYPE": "duty_type",
        "Una": "una",
        "ROUTE NO.": "route_no",
        "Trip Id": "trip_id",
        "EMP ID": "emp_id",
        "Team Type": "team_type",
        "Gender": "gender",
        "EMP NAME": "emp_name",
        "EMPLOYEE ADDRESS": "employee_address",
        "LOCATION": "location",
        "PICKUP TIME": "pickup_time",
        "REPORTING TIME": "reporting_time",
        "VENDOR": "vendor",
        "Ownership": "ownership",
        "CAB NO": "cab_no",
        "CAB NO2": "cab_no_2",
        "CAB TYPE": "cab_type",
        "USE ZONE KM": "use_zone_km",
        "CLAIM": "claim",
        "PASS ZONE": "pass_zone",
        "PASS AMOUNT": "pass_amount",
        "GUARD COST": "guard_cost",
        "GUARD": "guard",
        "TOLL NAME": "toll_name",
        "toll amount": "toll_amount",
        "REPORING AREA": "reporting_area",
        "BILL AT": "bill_at",
        "TRG TYPE": "trg_type",
        "TripCost": "trip_cost",
        "Total": "total",
    },
    numeric_fields=[
        "staff", "bill_count", "use_zone_km", "claim", "pass_amount",
        "guard_cost", "toll_amount", "trip_cost", "total",
    ],
    date_fields=["date"],
    required_fields=["cab_no"],
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
