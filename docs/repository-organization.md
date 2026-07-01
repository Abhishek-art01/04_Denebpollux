# Repository Organization Recommendation

## Current Shape

The repository now has three kinds of code:

- Production backend: `Billing/services/cloudflare-worker`
- Mature billing frontend: `Billing/apps/billing-web`
- Standalone business portals:
  - `Accounts/VenderPayments`
  - `Accounts/AccountsManagement`
  - `Accounts/CFO_Panal`
  - `02_21GS`
  - `01_Aravali/PCG`
  - `01_Aravali/Aravali_Dairy`

The standalone portals are Vite apps and now use the shared Cloudflare Worker
API plus Supabase/PostgreSQL through `public.app_records`.

## Recommended Target Layout

```text
apps/
├── billing-web/
├── accounts-management/
├── vendor-payments/
├── cfo-panel/
├── 21gs-food-hotel/
├── pcg-tea-stall/
└── aravali-dairy/

services/
└── api-worker/

infra/
└── supabase/

docs/
├── clients/
└── operations/

archive/
└── legacy/
```

## Why

- Keeps all deployable frontends under one `apps/` namespace.
- Keeps all runtime APIs under `services/`.
- Keeps database migrations under one `infra/supabase/` path.
- Removes mixed naming such as `CFO_Panal`, `VenderPayments`, and numbered
  root folders from active app paths.
- Makes future shared UI/API utilities easier to introduce.

## Migration Method

Move one app at a time and keep Vercel project roots updated:

1. Move app folder into `apps/{app-name}`.
2. Update Vercel project root directory.
3. Build and redeploy that app.
4. Keep redirects or README pointers from old folders until users switch.

Avoid moving all apps at once because each Vercel project is currently linked
to its existing directory.
