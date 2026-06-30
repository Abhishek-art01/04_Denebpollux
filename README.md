# 04_Denebpollux

Billing is now organized around one shared web app, one API gateway, one auth
backend, and multiple per-client billing backends.

```text
Billing Web App
      |
      v
API Gateway
      |
      +--> Auth Backend
      |
      +--> Agilent Billing Backend
      |
      +--> Air India Billing Backend
      |
      v
Common PostgreSQL database
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

The frontend calls only the gateway:

- Login: `/api/auth/login`
- Client APIs: `/api/clients/{client}/...`

The gateway validates the bearer token with the auth backend, then forwards the
request to the matching client backend configured in `CLIENT_BACKENDS`.

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
│   └── render/                   # deploy descriptors
└── archive/                      # non-active legacy/local artifacts
```

## Render backend hosting

The root [render.yaml](/workspaces/04_Denebpollux/render.yaml) hosts all billing
backends on Render:

- `denebpollux-billing-gateway`
- `denebpollux-billing-auth`
- `denebpollux-billing-agilent-api`
- `denebpollux-billing-airindia-api`
- `denebpollux-billing-db`

After the Blueprint is created, set `FRONTEND_ORIGIN` to the deployed frontend
URL and set `AUTH_USERS` to your real login users. The frontend should use:

```text
VITE_API_BASE_URL=https://denebpollux-billing-gateway.onrender.com/api
```
