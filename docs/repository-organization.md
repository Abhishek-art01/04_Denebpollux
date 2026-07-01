# Repository Organization

## Current Shape

The repository is now organized as a shared monorepo:

- Frontends live in `apps/`
- Runtime services live in `services/`
- Database migrations and schema work live in `infra/`
- Client and platform docs live in `docs/`
- Legacy artifacts live in `archive/`

Current active apps:

- `apps/admin-panel`
- `apps/billing-web`
- `apps/vendor-payments`
- `apps/accounts-management`
- `apps/cfo-panel`
- `apps/21gs-food-hotel`
- `apps/pcg-tea-stall`
- `apps/aravali-dairy`
- `apps/compliance`

Current active services:

- `services/cloudflare-worker`
- `services/api-gateway`
- `services/auth`
- `services/clients/agilent`
- `services/clients/airindia`

## Why This Layout

- All deployable frontends are in one namespace.
- All backend services are in one namespace.
- Database migrations are in one place.
- Old business labels and numbered folders are no longer part of active paths.
- The repo now matches the way the apps are actually deployed.
