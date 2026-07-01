# Cloudflare Worker Billing API

This backend is the Cloudflare-compatible replacement for the Python gateway,
auth service, and simple CRUD endpoints. It keeps the frontend API shape:

```text
/api/auth/*
/api/clients/:clientId/months
/api/clients/:clientId/manual-inputs/:month
/api/clients/:clientId/expenses/:month
/api/clients/:clientId/reports/:reportType?month=...
/api/clients/:clientId/upload/:sheetType
```

## Why This Shape

Cloudflare Workers Free is not a normal Python server runtime. The existing
FastAPI/Uvicorn services, pandas Excel parsing, SQLAlchemy sessions, and
PostgreSQL socket connections do not map cleanly to Workers Free.

This Worker uses:

- Web Crypto for signed session tokens.
- Supabase REST for table reads and upserts.
- Supabase REST for JSON row upload ingestion.
- Supabase RPC for report calculations.

Heavy work should live in Supabase Postgres functions, or the frontend should
convert Excel files to JSON before sending them to the Worker.

## Required Cloudflare Secrets

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put TOKEN_SECRET
wrangler secret put AUTH_USERS
```

`AUTH_USERS` uses the existing format:

```text
admin:strong-password:Admin
```

Multiple users can be comma-separated.

## Supabase Assumptions

Expose these schemas in Supabase API settings if you keep the current split:

- `agilent`
- `airindia`

Current table mapping:

```text
agilent.manual_inputs
agilent.expenses
airindia.airindia_manual_inputs
airindia.airindia_expenses
```

Reports are delegated to RPC functions named:

```text
billing_report_revenue_summary
billing_report_revenue_mix
billing_report_vehicle_wise_breakup
billing_report_ownership_breakup
billing_report_vehicle_revenue_summary
billing_report_pnl_summary
```

Each function receives:

```json
{ "client_id": "agilent", "report_month": "Jan-2026" }
```

Uploads are parsed in the browser and sent to the Worker as JSON:

```json
{
  "file_name": "input.xlsx",
  "sheet_name": "Sheet1",
  "rows": [
    { "Month": "Jan-2026", "VehicleNumber": "DL01AB1234", "TripCost": "1000" }
  ]
}
```

The Worker maps Excel headers to database columns and inserts into Supabase
REST tables directly. Report RPC functions are provided in
`infra/supabase/001_cloudflare_report_rpcs.sql`.

Exports are delegated to:

```text
billing_export_report
```

It receives:

```json
{
  "client_id": "agilent",
  "report_type": "revenue-summary",
  "report_month": "Jan-2026"
}
```

It must return:

```json
{
  "file_name": "revenue-summary_Jan-2026.xlsx",
  "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "content_base64": "..."
}
```
