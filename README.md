# 04_Denebpollux

Billing is now organized around one shared web app and one Cloudflare Worker
backend.

```text
Billing Web App
      |
      v
Cloudflare Worker Billing API
      |
      v
Supabase/PostgreSQL database
```

## Run the combined billing stack

```bash
cd Billing
docker compose up --build
```

- Billing Web App: http://localhost:5173
- API Gateway: http://localhost:8080/api/health
- Auth Backend: http://localhost:8010/api/health

If port `5173` is already taken, run with a different host port:

```bash
BILLING_WEB_PORT=5175 docker compose up --build
```

Default local login:

- Username: `admin`
- Password: `admin123`

Set `TOKEN_SECRET` and `AUTH_USERS` in your environment for real deployments.
`AUTH_USERS` is a comma-separated list using `username:password:Display Name`.

## Routing model

The frontend calls only the API base URL:

- Login: `/api/auth/login`
- Client APIs: `/api/clients/{client}/...`

In production, Vercel rewrites `/api/*` to the Cloudflare Worker. The Worker
handles auth, client APIs, uploads, and report RPC calls.

## Common database

Both client backends can point to the same PostgreSQL database. To avoid table
name collisions, the combined compose file sets:

- Agilent backend: `DB_SCHEMA=agilent`
- Air India backend: `DB_SCHEMA=airindia`

If `DB_SCHEMA` is not set, the old single-app behavior is preserved and tables
are created in the default schema.

## Billing directory layout

```text
Billing/
├── apps/
│   └── billing-web/              # single shared React frontend
├── services/
│   ├── api-gateway/              # routes all frontend API calls
│   ├── auth/                     # login/session backend
│   └── clients/
│       ├── agilent/              # Agilent billing backend
│       └── airindia/             # Air India billing backend
├── docs/
│   ├── clients/                  # formula and upload references
│   └── legacy/                   # old standalone compose files
├── infra/
│   └── supabase/                 # database functions for Worker reports
└── archive/                      # non-active legacy/local artifacts
```

## Cloudflare Worker Backend

The active production backend is the Cloudflare Worker in
[Billing/services/cloudflare-worker](/workspaces/04_Denebpollux/Billing/services/cloudflare-worker):

```text
https://denebpollux-billing-api.denebpollux-billing.workers.dev/api
```

Deploy from the Worker directory:

```bash
cd Billing/services/cloudflare-worker
npm run deploy
```
