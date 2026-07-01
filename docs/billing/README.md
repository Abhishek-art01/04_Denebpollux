# Billing

One shared Billing Web App sits behind a Cloudflare Worker API. The Worker
validates sessions and routes client-specific requests to Supabase tables and
report RPC functions.

```text
apps/billing-web
      |
      v
services/cloudflare-worker
      |
      v
infra/supabase
```

## Directory Layout

```text
apps/
├── billing-web/                  # single React frontend
services/
├── cloudflare-worker/            # production API backend
├── api-gateway/                  # public API entrypoint
├── auth/                         # login/session service
└── clients/
    ├── agilent/                  # Agilent billing backend
    └── airindia/                 # Air India billing backend
docs/
├── billing/clients/              # client formula/reference docs
└── billing/legacy/               # old standalone compose files
infra/
└── supabase/                     # database functions for Worker reports
archive/
├── billing/deploy-state/         # local deploy metadata, not active source
└── billing/legacy-frontends/      # archived duplicate frontend code
docker-compose.yml
.env.example
```

## Run

```bash
docker compose up --build
```

If port `5173` is busy:

```bash
BILLING_WEB_PORT=5175 docker compose up --build
```

Default local login:

- Username: `admin`
- Password: `admin123`

## Host Backend On Cloudflare

The active production backend is the Cloudflare Worker:

```text
https://denebpollux-billing-api.denebpollux-billing.workers.dev/api
```

Deploy it with Wrangler:

```bash
cd services/cloudflare-worker
npm run deploy
```

Required Worker secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TOKEN_SECRET`
- `AUTH_USERS`

The deployed Vercel frontend should call its same-origin API proxy:

```text
VITE_API_BASE_URL=/api
```

Vercel rewrites `/api/*` to the Cloudflare Worker defined in
`apps/billing-web/vercel.json`.
