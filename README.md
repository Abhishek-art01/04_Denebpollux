# 04_Denebpollux

This repo is now organized as a shared monorepo:

```text
apps/       frontend apps
services/   backend services
infra/      database and deployment infrastructure
docs/       platform and client documentation
archive/    legacy code and old deployment artifacts
```

## Run The Local Stack

```bash
docker compose up --build
```

- Billing web app: http://localhost:5173
- API gateway: http://localhost:8080/api/health

If port `5173` is busy:

```bash
BILLING_WEB_PORT=5175 docker compose up --build
```

Login uses Supabase email/password auth. Set `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in your local env.

## Current Layout

```text
apps/
├── billing-web/
├── admin-panel/
├── accounts-management/
├── vendor-payments/
├── cfo-panel/
├── 21gs-food-hotel/
├── pcg-tea-stall/
├── aravali-dairy/
└── compliance/

services/
├── cloudflare-worker/
├── api-gateway/
└── clients/
    ├── agilent/
    └── airindia/

infra/
└── supabase/

docs/
└── billing/

archive/
├── billing/
└── legacy/
```

## Routing Model

The frontend calls only the API base URL:

- Session check: `/api/auth/me`
- Client APIs: `/api/clients/{client}/...`

In production, Vercel rewrites `/api/*` to the Cloudflare Worker. The Worker
validates Supabase Auth sessions, handles client APIs, uploads, and report RPC calls.

## Cloudflare Worker Backend

The active production backend is the Cloudflare Worker in
[`services/cloudflare-worker`](./services/cloudflare-worker).

```text
https://denebpollux-billing-api.denebpollux-billing.workers.dev/api
```

Deploy from the Worker directory:

```bash
cd services/cloudflare-worker
npm run deploy
```
