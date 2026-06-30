# Billing

One shared Billing Web App sits behind an API gateway. The gateway validates
sessions with the auth service and routes client-specific requests to the
matching billing backend.

```text
apps/billing-web
      |
      v
services/api-gateway
      |
      +--> services/auth
      |
      +--> services/clients/agilent
      |
      +--> services/clients/airindia
      |
      v
common PostgreSQL database
```

## Directory Layout

```text
Billing/
├── apps/
│   └── billing-web/              # single React frontend
├── services/
│   ├── api-gateway/              # public API entrypoint
│   ├── auth/                     # login/session service
│   └── clients/
│       ├── agilent/              # Agilent billing backend
│       └── airindia/             # Air India billing backend
├── docs/
│   ├── clients/                  # client formula/reference docs
│   └── legacy/                   # old standalone compose files
├── infra/
│   └── render/                   # deployment descriptors
├── archive/
│   ├── deploy-state/             # local deploy metadata, not active source
│   └── legacy-frontends/         # archived duplicate frontend code
├── docker-compose.yml
└── .env.example
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

## Host Backends On Render

Use the root `render.yaml` Blueprint to create all backend infrastructure:

```text
denebpollux-billing-gateway
denebpollux-billing-auth
denebpollux-billing-agilent-api
denebpollux-billing-airindia-api
```

Render deploys:

- API Gateway from `Billing/services/api-gateway`
- Auth backend from `Billing/services/auth`
- Agilent backend from `Billing/services/clients/agilent`
- Air India backend from `Billing/services/clients/airindia`
- One external PostgreSQL database, with client tables split by `DB_SCHEMA`

Set these Render environment values after creating the Blueprint:

- `FRONTEND_ORIGIN`: your frontend origin, for example `https://billing-web-ashy.vercel.app`
- `AUTH_USERS`: comma-separated users, for example `admin:strong-password:Admin`
- `DATABASE_URL`: external PostgreSQL connection string for each client API

The gateway defaults assume Render creates these URLs:

```text
https://denebpollux-billing-auth.onrender.com
https://denebpollux-billing-agilent-api.onrender.com
https://denebpollux-billing-airindia-api.onrender.com
```

If Render changes a service URL, update the gateway env vars:

- `AUTH_BACKEND_URL`
- `CLIENT_BACKENDS`

The deployed Vercel frontend should call its same-origin API proxy:

```text
VITE_API_BASE_URL=/api
```

Vercel rewrites `/api/*` to the Render gateway defined in
`Billing/apps/billing-web/vercel.json`.
