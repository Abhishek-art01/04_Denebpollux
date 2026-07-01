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
- Auth backend: http://localhost:8010/api/health

If port `5173` is busy:

```bash
BILLING_WEB_PORT=5175 docker compose up --build
```

Default local login:

- Username: `admin`
- Password: `admin123`

Set `TOKEN_SECRET` and `AUTH_USERS` in your environment for real deployments.
`AUTH_USERS` is a comma-separated list using `username:password:Display Name`.

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
├── auth/
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

- Login: `/api/auth/login`
- Client APIs: `/api/clients/{client}/...`

In production, Vercel rewrites `/api/*` to the Cloudflare Worker. The Worker
handles auth, client APIs, uploads, and report RPC calls.

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
