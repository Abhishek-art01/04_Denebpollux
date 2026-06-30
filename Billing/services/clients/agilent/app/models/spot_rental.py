"""
SpotRental model - mirrors the "spotrentel" Excel sheet (50+ columns).
Only the columns actually used in calculations are heavily indexed;
all others are stored for completeness / future reporting / export fidelity.
"""
from sqlalchemy import Column, Integer, String, Float, Date

from app.database import Base


class SpotRental(Base):
    __tablename__ = "agilent_spot_rental"

    id = Column(Integer, primary_key=True, index=True)

    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String, nullable=True)
    duty_id = Column(String, nullable=True)
    customer_group = Column(String, nullable=True)
    vehicle_number = Column(String, index=True, nullable=False)
    ownership = Column(String, index=True, nullable=True)
    vehicle_name = Column(String, nullable=True)
    duty_type = Column(String, nullable=True)

    base_price = Column(Float, default=0.0)
    total_hours = Column(Float, default=0.0)
    extra_hours = Column(Float, default=0.0)
    customer_extra_time_cost_per_hr = Column(Float, default=0.0)
    total_km = Column(Float, default=0.0)
    extra_km = Column(Float, default=0.0)
    customer_extra_km_cost_per_km = Column(Float, default=0.0)

    all_base_price_total = Column(Float, default=0.0)
    extra_hours_cost = Column(Float, default=0.0)
    extra_km_charge = Column(Float, default=0.0)
    chargeable_outstation_allowance = Column(Float, default=0.0)
    chargeable_outstation_overnight_allowance = Column(Float, default=0.0)
    chargeable_night_allowance = Column(Float, default=0.0)
    chargeable_early_start_allowance = Column(Float, default=0.0)

    garage_end_speedo_km = Column(Float, default=0.0)
    garage_start_speedo_km = Column(Float, default=0.0)

    state_tax_nt = Column(Float, default=0.0)
    mcd_nt = Column(Float, default=0.0)
    toll_nt = Column(Float, default=0.0)
    parking_nt = Column(Float, default=0.0)
    guide_charge = Column(Float, default=0.0)
    miscellaneous = Column(Float, default=0.0)

    state_tax = Column(Float, default=0.0)
    toll = Column(Float, default=0.0)
    parking = Column(Float, default=0.0)
    mcd = Column(Float, default=0.0)

    # Key calculation columns
    total_billing_items_amount = Column(Float, default=0.0)
    without_gst_total_amount = Column(Float, default=0.0)
    vehicle_revenue = Column(Float, default=0.0)

    invoice_date = Column(Date, nullable=True)
    igst_18_invoice = Column(Float, default=0.0)
    sgst_2_5_invoice = Column(Float, default=0.0)
    cgst_2_5_invoice = Column(Float, default=0.0)
    igst_5_invoice = Column(Float, default=0.0)
    sgst_9_invoice = Column(Float, default=0.0)
    cgst_9_invoice = Column(Float, default=0.0)
    invoice_tax_amount = Column(Float, default=0.0)
    invoice_amount = Column(Float, default=0.0)

    labels = Column(String, nullable=True)
    dispatch_center = Column(String, nullable=True)
    from_city = Column(String, nullable=True)
    reporting_address = Column(String, nullable=True)
    to_city = Column(String, nullable=True)
    drop_address = Column(String, nullable=True)
    source = Column(String, nullable=True)

    month = Column(String, index=True, nullable=False)
