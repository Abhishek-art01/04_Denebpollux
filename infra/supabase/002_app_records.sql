create extension if not exists pgcrypto;

create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  app_id text not null,
  record_type text not null default 'entry',
  record_date date not null default current_date,
  title text,
  party text,
  category text,
  quantity numeric not null default 0,
  unit text,
  rate numeric not null default 0,
  amount numeric not null default 0,
  deduction numeric not null default 0,
  status text not null default 'draft',
  payment_mode text,
  reference text,
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_records_app_date_idx
  on public.app_records (app_id, record_date desc, created_at desc);

create index if not exists app_records_app_type_idx
  on public.app_records (app_id, record_type);

create index if not exists app_records_app_status_idx
  on public.app_records (app_id, status);
