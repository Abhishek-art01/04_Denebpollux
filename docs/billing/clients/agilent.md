# Agilent Billing Dashboard

> Reference doc after the directory reorganization. Active backend path:
> `services/clients/agilent`. Active frontend path:
> `apps/billing-web`.

A billing/revenue dashboard for Agilent's cab/vehicle operations. Upload monthly
Excel sheets (TripData, ChildCab, BackupCab, MaintenanceSecurity, SpotRental,
AdditionalCharges), enter a couple of manual monthly figures, and view/download
six computed reports.

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, pandas/openpyxl for Excel parsing
- **Frontend:** React (Vite), react-router-dom, axios

## Quick start (Docker / Codespaces)

For the shared real database, keep `DATABASE_URL` and `FRONTEND_ORIGIN` in
GitHub Codespaces secrets or environment variables. Do not commit a `.env`
file containing real credentials.

```bash
docker compose up --build frontend backend
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

If you need a fully local throwaway database instead, set the matching local
database URL for the shell session and enable the `local-db` profile:

```bash
export DATABASE_URL=postgresql://agilent_user:agilent_pass@db:5432/agilent_billing
export FRONTEND_ORIGIN=http://localhost:5173
docker compose --profile local-db up --build
```

## Quick start (manual)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env       # edit DATABASE_URL if needed
uvicorn app.main:app --reload
```

Tables are auto-created on startup via `Base.metadata.create_all()`. For
production, switch to Alembic migrations (scaffolding included under
`backend/alembic/` — run `alembic init alembic` to wire it up if needed).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the
backend at `http://localhost:8000` (see `vite.config.js`).

## Deploy: Vercel frontend + Cloudflare Worker backend

### Cloudflare Worker backend

The active production backend is the shared Worker at
`services/cloudflare-worker`.

Deploy it with:

```bash
cd services/cloudflare-worker
npm run deploy
```

Required Worker secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Vercel frontend

Vercel reads `vercel.json` and builds the Vite app from the frontend app directory.

Set this Vercel environment variable:

- `VITE_API_BASE_URL` = `/api`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

After changing `VITE_API_BASE_URL`, trigger a new Vercel deploy because Vite
injects environment variables at build time.

## Uploading data

Every sheet **must include a `Month` column** (e.g. `May-2026`) filled in
before upload — this is how the app filters every report. Go to **Upload
Data** in the navbar, pick the matching file for each of the 6 sheet types,
and upload. Re-uploading a month's sheet adds more rows (it does not
overwrite); if you need to replace a month's data, currently the cleanest
path is to delete the relevant DB rows directly (a "replace" option can be
added later if needed).

After uploading TripData/MaintenanceSecurity/ChildCab/BackupCab/SpotRental/
AdditionalCharges for a month, also fill in on the same Upload Data page:

- **Amount Recovered from Employees** — not present in any sheet; entered manually per month.
- **Expenses** (Fuel, Vehicle Maintenance Cost, Drivers Salaries, Vehicle EMI, Vendor Payment, GST, Employee Salary) — used only by the PNL/MIS Summary report.

## Dashboards

Default view is **PNL / MIS Summary**. Switch between all 6 reports using the
**Dashboard** dropdown in the navbar; switch months with the **Month**
dropdown. Every report has a **⬇ Download** button that exports that exact
view as a formatted `.xlsx` file.

1. **Detailed Revenue Summary** — full revenue waterfall with GST.
2. **Revenue Mix by Source** — % breakdown of revenue streams.
3. **Vehicle-wise Revenue Breakup** — per-vehicle revenue across all sources, including Spot Rental.
4. **Revenue by Ownership Type** — DNP Own vs Other, derived from #3.
5. **Vehicle Revenue Summary** — per-vehicle, gross TripCost basis (not Taxable Amount), Spot Rental net of Total Billing Items Amount.
6. **PNL / MIS Summary** *(default)* — Total Revenue (from #1) minus manual Expenses = Net Profit/(Loss).

## Locked formula reference

This is the exact calculation logic implemented in
`backend/app/services/*.py`. If business rules change, update here AND in
the corresponding service file.

| Report | TripData column | Maintenance / ChildCab / BackupCab | SpotRental column |
|---|---|---|---|
| #1 Detailed Revenue Summary | `Taxable Amount` | `TripCost` | `Without GST Total Amount` |
| #3 Vehicle-wise Revenue Breakup | `Taxable Amount` | `TripCost` | `Without GST Total Amount` |
| #5 Vehicle Revenue Summary | `TripCost` (gross) | `TripCost` | `Without GST Total Amount` − `Total Billing Items Amount` (each summed independently across all rows for the month, blanks treated as 0, then subtracted) |

Other locked rules:

- **Amount Recovered from Employees** — manual monthly input (no source column in any sheet).
- **Taxable Trip Amount** = Grand Total (Billable) − Amount Recovered.
- **Manpower / Technology / Dashcam / Razorpay charges** — summed from `AdditionalCharges.Taxable Amt.`, classified by matching the `Description` column against a configurable keyword table (`charge_category_mappings`, editable via `/api/charge-mappings`). Default keywords: "manpower", "technology", "tech cost", "dashcam", "razorpay".
- **CGST / SGST** — 9% + 9% shown for Taxable Trip Amount, each additional taxable revenue line, and Total Taxable Amount.
- **Net Amount Payable by Agilent** = Total Taxable Amount + CGST + SGST.
- **Total Revenue** = Net Amount Payable by Agilent + Amount Recovered from Employees.
- **Report #2 (Revenue Mix)** and **#4 (Ownership Breakup)** are derived from #1 and #3 respectively — no independent calculation.
- **Report #6 (PNL/MIS)** pulls Total Revenue from #1; Expenses are 100% manual input; Net Profit/(Loss) = Total Revenue − Total Expenses.

## File tree

```
agilent-billing-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/            # SQLAlchemy ORM (1 per sheet + manual_inputs, expenses, charge_category_mappings)
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── routers/           # upload, reports, export, manual_inputs, expenses, months, charge_mappings
│   │   ├── services/          # excel_parser, sheet_specs, revenue_calculator, vehicle_breakup,
│   │   │                      # ownership_breakup, pnl_calculator, addl_charges_mapper
│   │   └── utils/             # currency_format, excel_export
│   ├── tests/                 # pytest unit tests for the formula logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, MonthSelector, DashboardSelector
│   │   │   ├── shared/        # DataTable, SummaryCard, DownloadButton, EmptyState
│   │   │   ├── upload/        # UploadCard, ManualInputForm
│   │   │   └── reports/       # 6 report components
│   │   ├── pages/              # DashboardPage, UploadPage
│   │   ├── context/            # DashboardContext (selectedMonth, activeDashboard)
│   │   ├── api/                 # axios client + reports/uploads/manualInputs functions
│   │   └── styles/globals.css
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Tests

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v
```

Tests use an in-memory SQLite DB and validate the locked formula logic for
Reports #1, #3, #5, and #6 against synthetic data matching the original
spec's sample numbers.

## Known follow-ups (not yet built)

- No authentication/login — add if multiple users/roles need separation.
- Re-uploading a month appends rows rather than replacing; add a "delete month's data" action if overwrite behavior is needed.
- PDF export is not implemented (only `.xlsx`); add if required.
- Settings UI for the AdditionalCharges keyword mapping table exists as an API (`/api/charge-mappings`) but has no dedicated frontend page yet — currently editable only via API calls or directly in the DB.
