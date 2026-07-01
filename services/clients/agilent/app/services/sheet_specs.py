"""
Concrete SheetSpec definitions for every uploadable sheet, using the
exact header names supplied in the original spec.
"""
from app.services.excel_parser import SheetSpec
from app.models.trip_data import TripData
from app.models.child_cab import ChildCab
from app.models.backup_cab import BackupCab
from app.models.maintenance_security import MaintenanceSecurity
from app.models.spot_rental import SpotRental
from app.models.additional_charges import AdditionalCharges


TRIP_DATA_SPEC = SheetSpec(
    model=TripData,
    column_map={
        "Plan ID": "plan_id",
        "Roster Employee's": "roster_employee",
        "Shift": "shift",
        "Direction": "direction",
        "Shift Date": "shift_date",
        "VehicleNumber": "vehicle_number",
        "Ownership": "ownership",
        "Driver Name": "driver_name",
        "Make": "make",
        "Zone Name": "zone_name",
        "Biiling Zone": "billing_zone",
        "TripCost": "trip_cost",
        "MCD": "mcd",
        "HR Tax": "hr_tax",
        "Raj. & UP Tax": "raj_up_tax",
        "FBD Toll": "fbd_toll",
        "Bijwasan Toll": "bijwasan_toll",
        "Manesar Toll": "manesar_toll",
        "Taxable Amount": "taxable_amount",
        "Toll": "toll",
        "Remarks": "remarks",
    },
    numeric_fields=[
        "trip_cost", "mcd", "hr_tax", "raj_up_tax", "fbd_toll",
        "bijwasan_toll", "manesar_toll", "taxable_amount", "toll",
    ],
    date_fields=["shift_date"],
)

CHILD_CAB_SPEC = SheetSpec(
    model=ChildCab,
    column_map={
        "S. No": "s_no",
        "Date": "date",
        "Employee Name": "employee_name",
        "Time Period": "time_period",
        "Chauffer Name": "chauffer_name",
        "VehicleNumber": "vehicle_number",
        "ownership": "ownership",
        "TripCost": "trip_cost",
        "Location": "location",
    },
    numeric_fields=["trip_cost"],
    date_fields=["date"],
)

BACKUP_CAB_SPEC = SheetSpec(
    model=BackupCab,
    column_map={
        "Date": "date",
        "Time Period": "time_period",
        "Time Period 2": "time_period_2",
        "VehicleNumber": "vehicle_number",
        "Ownership": "ownership",
        "Tripcost": "trip_cost",
        "Cab Details": "cab_details",
        "Location": "location",
        "Remark": "remark",
    },
    numeric_fields=["trip_cost"],
    date_fields=["date"],
)

MAINTENANCE_SECURITY_SPEC = SheetSpec(
    model=MaintenanceSecurity,
    column_map={
        "Dated": "dated",
        "Shift time": "shift_time",
        "VehicleNumber": "vehicle_number",
        "Ownership": "ownership",
        "TripCost": "trip_cost",
        "Make": "make",
        "Driver": "driver",
        "Location": "location",
        "Order": "order",
    },
    numeric_fields=["trip_cost"],
    date_fields=["dated"],
)

SPOT_RENTAL_SPEC = SheetSpec(
    model=SpotRental,
    column_map={
        "Start Date": "start_date",
        "End Date": "end_date",
        "Status": "status",
        "Duty Id": "duty_id",
        "Customer Group": "customer_group",
        "VehicleNumber": "vehicle_number",
        "Ownership": "ownership",
        "Vehicle Name": "vehicle_name",
        "Duty Type": "duty_type",
        "Base Price": "base_price",
        "Total Hours": "total_hours",
        "Extra Hours": "extra_hours",
        "Customer Extra Time cost/HR": "customer_extra_time_cost_per_hr",
        "Total KM": "total_km",
        "Extra KM": "extra_km",
        "Customer Extra KM cost/KM": "customer_extra_km_cost_per_km",
        "All Base  Price Total": "all_base_price_total",
        "Extra Hours Cost": "extra_hours_cost",
        "Extra KM Charge": "extra_km_charge",
        "Chargeable Outstation allowance": "chargeable_outstation_allowance",
        "Chargeable Outstation overnight allowance": "chargeable_outstation_overnight_allowance",
        "Chargeable Night allowance": "chargeable_night_allowance",
        "Chargeable Early start allowance": "chargeable_early_start_allowance",
        "Garage End Speedo KM": "garage_end_speedo_km",
        "Garage Start Speedo KM": "garage_start_speedo_km",
        "State Tax (N.T)": "state_tax_nt",
        "MCD (N.T)": "mcd_nt",
        "Toll (N.T)": "toll_nt",
        "Parking (N.T)": "parking_nt",
        "Guide Charge": "guide_charge",
        "Miscellaneous": "miscellaneous",
        "State Tax": "state_tax",
        "Toll": "toll",
        "Parking": "parking",
        "MCD": "mcd",
        "Total Billing Items Amount": "total_billing_items_amount",
        "Without GST Total Amount": "without_gst_total_amount",
        "Vehicle Revenue": "vehicle_revenue",
        "Invoice Date": "invoice_date",
        "IGST 18 % - Invoice": "igst_18_invoice",
        "SGST2.5% - Invoice": "sgst_2_5_invoice",
        "CGST 2.5% - Invoice": "cgst_2_5_invoice",
        "IGST 5% - Invoice": "igst_5_invoice",
        "SGST 9% - Invoice": "sgst_9_invoice",
        "CGST 9% - Invoice": "cgst_9_invoice",
        "Invoice Tax Amount": "invoice_tax_amount",
        "Invoice Amount": "invoice_amount",
        "Labels": "labels",
        "Dispatch Center": "dispatch_center",
        "From city": "from_city",
        "Reporting Address": "reporting_address",
        "To city": "to_city",
        "Drop Address": "drop_address",
        "Source": "source",
    },
    numeric_fields=[
        "base_price", "total_hours", "extra_hours", "customer_extra_time_cost_per_hr",
        "total_km", "extra_km", "customer_extra_km_cost_per_km", "all_base_price_total",
        "extra_hours_cost", "extra_km_charge", "chargeable_outstation_allowance",
        "chargeable_outstation_overnight_allowance", "chargeable_night_allowance",
        "chargeable_early_start_allowance", "garage_end_speedo_km", "garage_start_speedo_km",
        "state_tax_nt", "mcd_nt", "toll_nt", "parking_nt", "guide_charge", "miscellaneous",
        "state_tax", "toll", "parking", "mcd", "total_billing_items_amount",
        "without_gst_total_amount", "vehicle_revenue", "igst_18_invoice", "sgst_2_5_invoice",
        "cgst_2_5_invoice", "igst_5_invoice", "sgst_9_invoice", "cgst_9_invoice",
        "invoice_tax_amount", "invoice_amount",
    ],
    date_fields=["start_date", "end_date", "invoice_date"],
)

ADDITIONAL_CHARGES_SPEC = SheetSpec(
    model=AdditionalCharges,
    column_map={
        "Description": "description",
        "Taxable Amt.": "taxable_amt",
        "GST@18%": "gst_18_percent",
        "Total Amt.": "total_amt",
    },
    numeric_fields=["taxable_amt", "gst_18_percent", "total_amt"],
    required_fields=["description"],
)
