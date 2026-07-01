create or replace function public.billing_report_agilent_revenue_summary(client_id text, report_month text)
returns jsonb
language plpgsql
stable
as $$
declare
  total_trip_amount numeric := 0;
  maintenance_charges numeric := 0;
  creche_duty_charges numeric := 0;
  odd_hours_cab_cost numeric := 0;
  amount_recovered numeric := 0;
  manpower_charges numeric := 0;
  technology_cost_recovery numeric := 0;
  dashcam_subscription_recovery numeric := 0;
  razorpay_fee_recovery numeric := 0;
  spot_rental_revenue numeric := 0;
  grand_total_billable numeric := 0;
  taxable_trip_amount numeric := 0;
  total_taxable_amount numeric := 0;
  cgst_total numeric := 0;
  sgst_total numeric := 0;
  net_amount_payable numeric := 0;
  total_revenue numeric := 0;
begin
  select coalesce(sum(taxable_amount), 0) into total_trip_amount from public.agilent_trip_data where month = report_month;
  select coalesce(sum(trip_cost), 0) into maintenance_charges from public.agilent_maintenance_security where month = report_month;
  select coalesce(sum(trip_cost), 0) into creche_duty_charges from public.agilent_child_cab where month = report_month;
  select coalesce(sum(trip_cost), 0) into odd_hours_cab_cost from public.agilent_backup_cab where month = report_month;
  select coalesce((
    select amount_recovered_from_employees from public.manual_inputs where month = report_month limit 1
  ), 0) into amount_recovered;

  select coalesce(sum(taxable_amt), 0) into manpower_charges
  from public.agilent_additional_charges
  where month = report_month and coalesce(description, '') ilike '%manpower%';

  select coalesce(sum(taxable_amt), 0) into technology_cost_recovery
  from public.agilent_additional_charges
  where month = report_month and (coalesce(description, '') ilike '%technology%' or coalesce(description, '') ilike '%tech cost%');

  select coalesce(sum(taxable_amt), 0) into dashcam_subscription_recovery
  from public.agilent_additional_charges
  where month = report_month and coalesce(description, '') ilike '%dashcam%';

  select coalesce(sum(taxable_amt), 0) into razorpay_fee_recovery
  from public.agilent_additional_charges
  where month = report_month and coalesce(description, '') ilike '%razorpay%';

  select coalesce(sum(without_gst_total_amount), 0) into spot_rental_revenue
  from public.agilent_spot_rental where month = report_month;

  grand_total_billable := total_trip_amount + maintenance_charges + creche_duty_charges + odd_hours_cab_cost;
  taxable_trip_amount := grand_total_billable - amount_recovered;
  total_taxable_amount := taxable_trip_amount + manpower_charges + technology_cost_recovery
    + dashcam_subscription_recovery + razorpay_fee_recovery + spot_rental_revenue;
  cgst_total := total_taxable_amount * 0.09;
  sgst_total := total_taxable_amount * 0.09;
  net_amount_payable := total_taxable_amount + cgst_total + sgst_total;
  total_revenue := net_amount_payable + amount_recovered;

  return jsonb_build_object(
    'month', report_month,
    'total_trip_amount', total_trip_amount,
    'maintenance_charges', maintenance_charges,
    'creche_duty_charges', creche_duty_charges,
    'odd_hours_cab_cost', odd_hours_cab_cost,
    'grand_total_billable', grand_total_billable,
    'amount_recovered_from_employees', amount_recovered,
    'taxable_trip_amount', taxable_trip_amount,
    'taxable_trip_cgst', taxable_trip_amount * 0.09,
    'taxable_trip_sgst', taxable_trip_amount * 0.09,
    'taxable_trip_total', taxable_trip_amount * 1.18,
    'manpower_charges', manpower_charges,
    'manpower_cgst', manpower_charges * 0.09,
    'manpower_sgst', manpower_charges * 0.09,
    'manpower_total', manpower_charges * 1.18,
    'technology_cost_recovery', technology_cost_recovery,
    'technology_cgst', technology_cost_recovery * 0.09,
    'technology_sgst', technology_cost_recovery * 0.09,
    'technology_total', technology_cost_recovery * 1.18,
    'dashcam_subscription_recovery', dashcam_subscription_recovery,
    'dashcam_cgst', dashcam_subscription_recovery * 0.09,
    'dashcam_sgst', dashcam_subscription_recovery * 0.09,
    'dashcam_total', dashcam_subscription_recovery * 1.18,
    'razorpay_fee_recovery', razorpay_fee_recovery,
    'razorpay_cgst', razorpay_fee_recovery * 0.09,
    'razorpay_sgst', razorpay_fee_recovery * 0.09,
    'razorpay_total', razorpay_fee_recovery * 1.18,
    'spot_rental_revenue', spot_rental_revenue,
    'spot_rental_cgst', spot_rental_revenue * 0.09,
    'spot_rental_sgst', spot_rental_revenue * 0.09,
    'spot_rental_total', spot_rental_revenue * 1.18,
    'total_taxable_amount', total_taxable_amount,
    'cgst_total', cgst_total,
    'sgst_total', sgst_total,
    'net_amount_payable_by_agilent', net_amount_payable,
    'total_revenue', total_revenue
  );
end;
$$;

create or replace function public.billing_report_agilent_revenue_mix(client_id text, report_month text)
returns jsonb
language sql
stable
as $$
  with s as (
    select public.billing_report_agilent_revenue_summary(client_id, report_month) data
  ),
  items as (
    select * from (
      values
        ('Trip Revenue (Net of Recovery)', ((select data from s)->>'grand_total_billable')::numeric),
        ('Spot Rental Revenue', ((select data from s)->>'spot_rental_revenue')::numeric),
        ('Manpower Charges', ((select data from s)->>'manpower_charges')::numeric),
        ('Technology Cost Recovery', ((select data from s)->>'technology_cost_recovery')::numeric),
        ('Dashcam Subscription Recovery', ((select data from s)->>'dashcam_subscription_recovery')::numeric),
        ('Razorpay Fee Recovery', ((select data from s)->>'razorpay_fee_recovery')::numeric),
        ('GST Collected (CGST+SGST)', (((select data from s)->>'cgst_total')::numeric + ((select data from s)->>'sgst_total')::numeric))
    ) as item(revenue_source, amount)
  )
  select jsonb_build_object(
    'month', report_month,
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'revenue_source', revenue_source,
      'amount', amount,
      'percent_of_total', case when ((select data from s)->>'total_revenue')::numeric = 0 then 0 else round((amount / ((select data from s)->>'total_revenue')::numeric * 100)::numeric, 2) end
    )), '[]'::jsonb),
    'total_revenue', ((select data from s)->>'total_revenue')::numeric
  )
  from items;
$$;

create or replace function public.billing_report_agilent_vehicle_wise_breakup(client_id text, report_month text)
returns jsonb
language sql
stable
as $$
  with vehicle_amounts as (
    select vehicle_number, max(ownership) ownership, sum(trip_data_amount) trip_data_amount,
      sum(spot_rental) spot_rental, sum(maintenance_veh_amount) maintenance_veh_amount,
      sum(child_cab_amount) child_cab_amount, sum(backup_cabs_amount) backup_cabs_amount
    from (
      select vehicle_number, ownership, coalesce(sum(taxable_amount), 0) trip_data_amount, 0::numeric spot_rental, 0::numeric maintenance_veh_amount, 0::numeric child_cab_amount, 0::numeric backup_cabs_amount
      from public.agilent_trip_data where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, coalesce(sum(without_gst_total_amount), 0), 0, 0, 0
      from public.agilent_spot_rental where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, 0, coalesce(sum(trip_cost), 0), 0, 0
      from public.agilent_maintenance_security where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, 0, 0, coalesce(sum(trip_cost), 0), 0
      from public.agilent_child_cab where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, 0, 0, 0, coalesce(sum(trip_cost), 0)
      from public.agilent_backup_cab where month = report_month group by vehicle_number, ownership
    ) source
    where vehicle_number is not null
    group by vehicle_number
  ),
  rows as (
    select vehicle_number, coalesce(ownership, 'Other') ownership, trip_data_amount, spot_rental,
      maintenance_veh_amount, child_cab_amount, backup_cabs_amount,
      trip_data_amount + spot_rental + maintenance_veh_amount + child_cab_amount + backup_cabs_amount grand_total
    from vehicle_amounts
  ),
  totals as (
    select coalesce(sum(trip_data_amount), 0) grand_total_trip_data,
      coalesce(sum(spot_rental), 0) grand_total_spot_rental,
      coalesce(sum(maintenance_veh_amount), 0) grand_total_maintenance,
      coalesce(sum(child_cab_amount), 0) grand_total_child_cab,
      coalesce(sum(backup_cabs_amount), 0) grand_total_backup_cab,
      coalesce(sum(grand_total), 0) grand_total_overall
    from rows
  )
  select jsonb_build_object(
    'month', report_month,
    'rows', coalesce(jsonb_agg(jsonb_build_object(
      'vehicle_number', r.vehicle_number,
      'ownership', r.ownership,
      'trip_data_amount', r.trip_data_amount,
      'spot_rental', r.spot_rental,
      'maintenance_veh_amount', r.maintenance_veh_amount,
      'child_cab_amount', r.child_cab_amount,
      'backup_cabs_amount', r.backup_cabs_amount,
      'grand_total', r.grand_total,
      'percent_of_total', case when t.grand_total_overall = 0 then 0 else round((r.grand_total / t.grand_total_overall * 100)::numeric, 2) end
    ) order by r.vehicle_number) filter (where r.vehicle_number is not null), '[]'::jsonb),
    'grand_total_trip_data', t.grand_total_trip_data,
    'grand_total_spot_rental', t.grand_total_spot_rental,
    'grand_total_maintenance', t.grand_total_maintenance,
    'grand_total_child_cab', t.grand_total_child_cab,
    'grand_total_backup_cab', t.grand_total_backup_cab,
    'grand_total_overall', t.grand_total_overall
  )
  from totals t
  left join rows r on true
  group by t.grand_total_trip_data, t.grand_total_spot_rental, t.grand_total_maintenance, t.grand_total_child_cab, t.grand_total_backup_cab, t.grand_total_overall;
$$;

create or replace function public.billing_report_agilent_ownership_breakup(client_id text, report_month text)
returns jsonb
language sql
stable
as $$
  with report as (
    select public.billing_report_agilent_vehicle_wise_breakup(client_id, report_month) data
  ),
  rows as (
    select item->>'ownership' ownership, (item->>'grand_total')::numeric amount
    from report, jsonb_array_elements(data->'rows') item
  ),
  grouped as (
    select ownership, sum(amount) amount from rows group by ownership
  ),
  total as (
    select coalesce(sum(amount), 0) amount from grouped
  )
  select jsonb_build_object(
    'month', report_month,
    'rows', coalesce(jsonb_agg(jsonb_build_object(
      'ownership_type', grouped.ownership,
      'total_revenue', grouped.amount,
      'percent_of_total', case when total.amount = 0 then 0 else round((grouped.amount / total.amount * 100)::numeric, 2) end
    ) order by grouped.ownership) filter (where grouped.ownership is not null), '[]'::jsonb),
    'total', total.amount
  )
  from total
  left join grouped on true
  group by total.amount;
$$;

create or replace function public.billing_report_agilent_vehicle_revenue_summary(client_id text, report_month text)
returns jsonb
language sql
stable
as $$
  with vehicle_amounts as (
    select vehicle_number, max(ownership) ownership, sum(trip_data_amount) trip_data_amount,
      sum(spot_rental) spot_rental, sum(maintenance_veh_amount) maintenance_veh_amount,
      sum(child_cab_amount) child_cab_amount, sum(backup_cabs_amount) backup_cabs_amount
    from (
      select vehicle_number, ownership, coalesce(sum(trip_cost), 0) trip_data_amount, 0::numeric spot_rental, 0::numeric maintenance_veh_amount, 0::numeric child_cab_amount, 0::numeric backup_cabs_amount
      from public.agilent_trip_data where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, coalesce(sum(without_gst_total_amount), 0) - coalesce(sum(total_billing_items_amount), 0), 0, 0, 0
      from public.agilent_spot_rental where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, 0, coalesce(sum(trip_cost), 0), 0, 0
      from public.agilent_maintenance_security where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, 0, 0, coalesce(sum(trip_cost), 0), 0
      from public.agilent_child_cab where month = report_month group by vehicle_number, ownership
      union all
      select vehicle_number, ownership, 0, 0, 0, 0, coalesce(sum(trip_cost), 0)
      from public.agilent_backup_cab where month = report_month group by vehicle_number, ownership
    ) source
    where vehicle_number is not null
    group by vehicle_number
  ),
  rows as (
    select vehicle_number, coalesce(ownership, 'Other') ownership, trip_data_amount, spot_rental,
      maintenance_veh_amount, child_cab_amount, backup_cabs_amount,
      trip_data_amount + spot_rental + maintenance_veh_amount + child_cab_amount + backup_cabs_amount grand_total
    from vehicle_amounts
  ),
  totals as (
    select coalesce(sum(trip_data_amount), 0) grand_total_trip_data,
      coalesce(sum(spot_rental), 0) grand_total_spot_rental,
      coalesce(sum(maintenance_veh_amount), 0) grand_total_maintenance,
      coalesce(sum(child_cab_amount), 0) grand_total_child_cab,
      coalesce(sum(backup_cabs_amount), 0) grand_total_backup_cab,
      coalesce(sum(grand_total), 0) grand_total_overall
    from rows
  )
  select jsonb_build_object(
    'month', report_month,
    'rows', coalesce(jsonb_agg(to_jsonb(r) order by r.vehicle_number) filter (where r.vehicle_number is not null), '[]'::jsonb),
    'grand_total_trip_data', t.grand_total_trip_data,
    'grand_total_spot_rental', t.grand_total_spot_rental,
    'grand_total_maintenance', t.grand_total_maintenance,
    'grand_total_child_cab', t.grand_total_child_cab,
    'grand_total_backup_cab', t.grand_total_backup_cab,
    'grand_total_overall', t.grand_total_overall
  )
  from totals t
  left join rows r on true
  group by t.grand_total_trip_data, t.grand_total_spot_rental, t.grand_total_maintenance, t.grand_total_child_cab, t.grand_total_backup_cab, t.grand_total_overall;
$$;

create or replace function public.billing_report_agilent_pnl_summary(client_id text, report_month text)
returns jsonb
language sql
stable
as $$
  with s as (
    select public.billing_report_agilent_revenue_summary(client_id, report_month) data
  ),
  e as (
    select * from public.expenses where month = report_month limit 1
  ),
  items as (
    select * from (
      values
        ('Fuel', coalesce((select fuel from e), 0)),
        ('VehicleMaintainenceCost', coalesce((select vehicle_maintenance_cost from e), 0)),
        ('DriversSalaries', coalesce((select drivers_salaries from e), 0)),
        ('VehicleEMI', coalesce((select vehicle_emi from e), 0)),
        ('VenderPayment', coalesce((select vendor_payment from e), 0)),
        ('GST', coalesce((select gst from e), 0)),
        ('EmployeeSalary', coalesce((select employee_salary from e), 0))
    ) item(particulars, amount)
  ),
  totals as (
    select ((select data from s)->>'total_revenue')::numeric total_revenue, coalesce(sum(amount), 0) total_expenses from items
  )
  select jsonb_build_object(
    'month', report_month,
    'total_revenue', totals.total_revenue,
    'expenses', coalesce(jsonb_agg(jsonb_build_object(
      'particulars', items.particulars,
      'amount', items.amount,
      'percent_of_sale', case when totals.total_revenue = 0 then 0 else round((items.amount / totals.total_revenue * 100)::numeric, 2) end
    )), '[]'::jsonb),
    'total_expenses', totals.total_expenses,
    'net_profit_loss', totals.total_revenue - totals.total_expenses,
    'net_margin_percent', case when totals.total_revenue = 0 then 0 else round(((totals.total_revenue - totals.total_expenses) / totals.total_revenue * 100)::numeric, 2) end
  )
  from totals, items
  group by totals.total_revenue, totals.total_expenses;
$$;

create or replace function public.billing_report_airindia_revenue_summary(client_id text, report_month text)
returns jsonb
language plpgsql
stable
as $$
declare
  trip_amount_t3 numeric := 0;
  toll_amount_t3 numeric := 0;
  mcd numeric := 0;
  t3_driver_penalty numeric := 0;
  t3_employee_penalty numeric := 0;
  trip_amount_aiaa numeric := 0;
  toll_amount_aiaa numeric := 0;
  aiaa_driver_penalty numeric := 0;
  aiaa_employee_penalty numeric := 0;
  total_of_terminal3 numeric := 0;
  total_of_aiaa numeric := 0;
  total_taxable_amount numeric := 0;
  gst_t3 numeric := 0;
  gst_aiaa numeric := 0;
  gst_total numeric := 0;
  total_revenue numeric := 0;
begin
  select coalesce(sum(trip_cost), 0), coalesce(sum(toll_amount), 0) into trip_amount_t3, toll_amount_t3
  from public.airindia_trip_data_terminal3 where month = report_month;

  select coalesce(sum(airindia_sundries.mcd), 0) into mcd from public.airindia_sundries where month = report_month;
  select coalesce(sum(amount), 0) into t3_driver_penalty from public.airindia_penalty_vehicle_wise where month = report_month and entity = 'T-3';
  select coalesce((
    select employee_penalty_t3 from public.airindia_manual_inputs where month = report_month limit 1
  ), 0) into t3_employee_penalty;

  select coalesce((
    select employee_penalty_aiaa from public.airindia_manual_inputs where month = report_month limit 1
  ), 0) into aiaa_employee_penalty;

  select coalesce(sum(trip_cost), 0), coalesce(sum(toll_amount), 0) into trip_amount_aiaa, toll_amount_aiaa
  from public.airindia_trip_data_aiaa where month = report_month;

  select coalesce(sum(amount), 0) into aiaa_driver_penalty from public.airindia_penalty_vehicle_wise where month = report_month and entity = 'AIAA';

  total_of_terminal3 := trip_amount_t3 + toll_amount_t3 + mcd - t3_driver_penalty - t3_employee_penalty;
  total_of_aiaa := trip_amount_aiaa + toll_amount_aiaa - aiaa_driver_penalty - aiaa_employee_penalty;
  total_taxable_amount := total_of_terminal3 + total_of_aiaa;
  gst_t3 := total_of_terminal3 * 0.05;
  gst_aiaa := total_of_aiaa * 0.05;
  gst_total := gst_t3 + gst_aiaa;
  total_revenue := total_taxable_amount + gst_total;

  return jsonb_build_object(
    'month', report_month,
    'trip_amount_t3', trip_amount_t3,
    'toll_amount_t3', toll_amount_t3,
    'mcd', mcd,
    't3_driver_penalty', t3_driver_penalty,
    't3_employee_penalty', t3_employee_penalty,
    'total_of_terminal3', total_of_terminal3,
    'trip_amount_aiaa', trip_amount_aiaa,
    'toll_amount_aiaa', toll_amount_aiaa,
    'aiaa_driver_penalty', aiaa_driver_penalty,
    'aiaa_employee_penalty', aiaa_employee_penalty,
    'total_of_aiaa', total_of_aiaa,
    'total_taxable_amount', total_taxable_amount,
    'gst_t3', gst_t3,
    'gst_aiaa', gst_aiaa,
    'gst_total', gst_total,
    'total_revenue', total_revenue
  );
end;
$$;

create or replace function public.billing_report_airindia_vehicle_revenue_summary(client_id text, report_month text)
returns jsonb
language sql
stable
as $$
  with t3 as (
    select cab_no vehicle_number, max(ownership) ownership, max(cab_type) veh_type, coalesce(sum(trip_cost), 0) amount
    from public.airindia_trip_data_terminal3 where month = report_month group by cab_no
  ),
  aiaa as (
    select cab_no vehicle_number, max(ownership) ownership, max(cab_type) veh_type, coalesce(sum(trip_cost), 0) amount
    from public.airindia_trip_data_aiaa where month = report_month group by cab_no
  ),
  penalties as (
    select vehicle_no vehicle_number,
      coalesce(sum(amount) filter (where entity = 'T-3'), 0) t3_penalty,
      coalesce(sum(amount) filter (where entity = 'AIAA'), 0) aiaa_penalty,
      max(ownership) ownership
    from public.airindia_penalty_vehicle_wise where month = report_month group by vehicle_no
  ),
  vehicles as (
    select vehicle_number from t3 union select vehicle_number from aiaa union select vehicle_number from penalties
  ),
  rows as (
    select v.vehicle_number,
      coalesce(t3.ownership, aiaa.ownership, penalties.ownership, 'Other') ownership,
      coalesce(t3.veh_type, aiaa.veh_type, '') veh_type,
      coalesce(t3.amount, 0) - coalesce(penalties.t3_penalty, 0) t3_amount,
      coalesce(aiaa.amount, 0) - coalesce(penalties.aiaa_penalty, 0) aiaa_amount,
      coalesce(t3.amount, 0) - coalesce(penalties.t3_penalty, 0) + coalesce(aiaa.amount, 0) - coalesce(penalties.aiaa_penalty, 0) total
    from vehicles v
    left join t3 on t3.vehicle_number = v.vehicle_number
    left join aiaa on aiaa.vehicle_number = v.vehicle_number
    left join penalties on penalties.vehicle_number = v.vehicle_number
  ),
  totals as (
    select coalesce(sum(t3_amount), 0) grand_total_t3, coalesce(sum(aiaa_amount), 0) grand_total_aiaa, coalesce(sum(total), 0) grand_total_overall
    from rows
  )
  select jsonb_build_object(
    'month', report_month,
    'rows', coalesce(jsonb_agg(to_jsonb(r) order by r.vehicle_number) filter (where r.vehicle_number is not null), '[]'::jsonb),
    'grand_total_t3', t.grand_total_t3,
    'grand_total_aiaa', t.grand_total_aiaa,
    'grand_total_overall', t.grand_total_overall
  )
  from totals t
  left join rows r on true
  group by t.grand_total_t3, t.grand_total_aiaa, t.grand_total_overall;
$$;

create or replace function public.billing_report_airindia_pnl_summary(client_id text, report_month text)
returns jsonb
language sql
stable
as $$
  with s as (
    select public.billing_report_airindia_revenue_summary(client_id, report_month) data
  ),
  e as (
    select * from public.airindia_expenses where month = report_month limit 1
  ),
  amounts as (
    select ((select data from s)->>'total_revenue')::numeric total_revenue,
      (((select data from s)->>'mcd')::numeric + ((select data from s)->>'toll_amount_t3')::numeric + ((select data from s)->>'toll_amount_aiaa')::numeric) toll_parking
  ),
  total_expenses as (
    select coalesce((select fuel from e), 0) + coalesce((select vehicle_maintenance_cost from e), 0)
      + coalesce((select drivers_salaries from e), 0) + coalesce((select vehicle_emi from e), 0)
      + coalesce((select razorpay_transaction_fee from e), 0) + (select toll_parking from amounts)
      + coalesce((select vendor_payment from e), 0) + coalesce((select employee_salary from e), 0)
      + coalesce((select gst from e), 0) amount
  )
  select jsonb_build_object(
    'month', report_month,
    'total_revenue', amounts.total_revenue,
    'fuel', jsonb_build_object('particulars', 'Fuel', 'amount', coalesce((select fuel from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select fuel from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'vehicle_maintenance_cost', jsonb_build_object('particulars', 'VehicleMaintainenceCost', 'amount', coalesce((select vehicle_maintenance_cost from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select vehicle_maintenance_cost from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'drivers_salaries', jsonb_build_object('particulars', 'DriversSalaries', 'amount', coalesce((select drivers_salaries from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select drivers_salaries from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'vehicle_emi', jsonb_build_object('particulars', 'VehicleEMI', 'amount', coalesce((select vehicle_emi from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select vehicle_emi from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'razorpay_transaction_fee', jsonb_build_object('particulars', 'Razorpay Transaction Fee', 'amount', coalesce((select razorpay_transaction_fee from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select razorpay_transaction_fee from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'mcd_state_taxes_toll_parking', jsonb_build_object('particulars', 'MCD/State Taxs/Toll And Parking', 'amount', amounts.toll_parking, 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((amounts.toll_parking / amounts.total_revenue * 100)::numeric, 2) end),
    'vendor_payment', jsonb_build_object('particulars', 'VenderPayment', 'amount', coalesce((select vendor_payment from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select vendor_payment from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'employee_salary', jsonb_build_object('particulars', 'EmployeeSalary', 'amount', coalesce((select employee_salary from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select employee_salary from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'gst', jsonb_build_object('particulars', 'GST', 'amount', coalesce((select gst from e), 0), 'percent_of_sale', case when amounts.total_revenue = 0 then 0 else round((coalesce((select gst from e), 0) / amounts.total_revenue * 100)::numeric, 2) end),
    'total_expenses', total_expenses.amount,
    'net_profit_loss', amounts.total_revenue - total_expenses.amount,
    'net_margin_percent', case when amounts.total_revenue = 0 then 0 else round(((amounts.total_revenue - total_expenses.amount) / amounts.total_revenue * 100)::numeric, 2) end
  )
  from amounts, total_expenses;
$$;
