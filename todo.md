# Spurs BaaS — Build Plan

A Firebase/Supabase-class Backend-as-a-Service, built as **one full-stack Next.js
app** (no separate FastAPI backend — route handlers in `app/api/**` *are* the
backend). Login is delegated to **Spurs Cloud SSO** (the `accounts` OIDC
provider). Modeled on `architectural-infrastructure/baas/frontend`, adapted to
full Next.js + Spurs identity.

---

## Architecture

- **Runtime:** Next.js 16 (App Router), React 19, Tailwind 4. UI + API in one repo.
- **Auth:** Spurs SSO via OIDC (authorization-code + PKCE). ✅ *done* — see
  `lib/spurs-oidc.ts`, `lib/session.ts`, `app/auth/*`, `middleware.ts`.
- **Data plane (cloud, already in `.env`):**
  | Service | Provider | Node lib |
  |---|---|---|
  | Relational / SQL | **Neon Postgres** (`DATABASE_SYNC_URL`) | `drizzle-orm` + `postgres` |
  | NoSQL documents | **MongoDB** (`MONGODB_URL`) | `mongodb` |
  | Cache / KV / pub-sub / queues | **Upstash Redis** (`REDIS_URL`) | `ioredis` + `bullmq` |
  | Object storage / buckets | **Backblaze B2 (S3)** (`MINIO_*`) | `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` |
  | Realtime transport | socket.io **or** SSE | `socket.io` / native |
- **UI kit:** shadcn (Base UI) + `lucide-react` + `recharts`; `@tanstack/react-query`
  for data, `zustand` for client state, `zod` for validation.
- **Email / billing / AI:** `nodemailer` (SMTP), Paystack/Stripe/Flutterwave, OpenAI —
  all keys already stubbed in `.env`.

> Naming note (from review): the platform's own control-plane database is
> **Spurs-branded** (e.g. `spurs_baas` / schema `spurs`), not `baas_platform`.
> Update `MONGODB_DB_NAME` and Postgres schema names accordingly.

---

## Dependencies to add (when each phase starts)

```
# data
npm i drizzle-orm postgres mongodb ioredis bullmq
npm i -D drizzle-kit
# storage
npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
# ui / state / validation
npm i @tanstack/react-query zustand zod class-variance-authority clsx tailwind-merge lucide-react recharts
# realtime + email
npm i socket.io socket.io-client nodemailer
# testing
npm i -D vitest @playwright/test
```
(`jose` already installed for the session cookie.)

---

## Route map (target — mirrors the reference)

```
app/
  (marketing)/           # public: landing, /pricing
  auth/                  # Spurs SSO: login, start, callback, logout   ✅ done
  (dashboard)/
    u/[userId]/
      page.tsx           # user home (project list)
      projects/new/      # create project
      projects/[projectId]/
        overview/  database/  nosql/  realtime/
        functions/ storage/   auth/   settings/  billing/
  (superadmin)/          # audit, billing, flags, organizations, projects, staff, users
  api/internal/          # api-keys, billing, functions, nosql, notifications,
                         # projects, realtime, settings, sql   (Next route handlers)
  docs/                  # quickstart-js/python, sql, nosql, kv, storage,
                         # realtime, functions, auth, api-reference
components/
  layout/ (Sidebar, TopNav, LayoutShell)
  dashboard/ database/ nosql/ realtime/ functions/ storage/ settings/ billing/ docs/
lib/  db/ (drizzle schema + client), mongo, redis, s3, spurs-oidc ✅, session ✅
```

---

## Phases

### Phase 0 — Foundation ✅ DONE
- [x] Spurs SSO OIDC client (PKCE, state) — `lib/spurs-oidc.ts`
- [x] Signed session cookie (jose) — `lib/session.ts`
- [x] `/auth/start`, `/auth/callback`, `/auth/logout`, `/auth/login` page
- [x] `middleware.ts` gates the console behind a Spurs session
- [x] Console shell placeholder (`app/page.tsx`)
- [x] Registered `Spurs BaaS Console` OIDC client in `accounts`
- [x] Fixed consent to use native form posts (OAuth redirect works)

### Phase 1 — App shell & projects
- [ ] `lib/db` — Drizzle client against Neon (`DATABASE_SYNC_URL`) + schema
- [ ] Control-plane schema: `users` (mirror of Spurs sub), `projects`, `members`, `api_keys`
- [ ] `drizzle-kit` migrations + first push
- [ ] Layout: `LayoutShell`, `Sidebar`, `TopNav` (shadcn + lucide)
- [ ] Dashboard home: StatCards, ProjectGrid/List, ActivityFeed, PlanBanner
- [ ] Projects CRUD (`api/internal/projects`) + create-project wizard
- [ ] Project switcher + `projects/[projectId]/overview`

### Phase 2 — Database service (SQL)
- [ ] Per-project Postgres schema/db provisioning on Neon
- [ ] Tables browser (list/create/alter) — `AddTableDialog`, `DatabaseClient`
- [ ] SQL editor (`api/internal/sql/query`) with result grid
- [ ] Auto REST endpoints per table (PostgREST-style) + row CRUD UI

### Phase 3 — NoSQL collections
- [ ] `lib/mongo` client
- [ ] Collections + documents CRUD (`api/internal/nosql/*`, `NoSQLPageClient`)
- [ ] JSON document editor + query

### Phase 4 — Storage (buckets)
- [ ] `lib/s3` (Backblaze B2 client) + presigned URLs
- [ ] Bucket create/list, `StorageBrowser` + `StorageDashboard`
- [ ] Upload/download, public/private objects

### Phase 5 — Realtime
- [ ] Redis pub/sub (`lib/redis`) or Postgres LISTEN/NOTIFY
- [ ] socket.io server (route handler / custom server) + client
- [ ] Subscribe to table/collection changes — `RealtimePageClient`

### Phase 6 — Auth-as-a-service, API keys, Functions
- [ ] Per-project end-user auth (project acts as its own IdP or uses Spurs)
- [ ] API keys issue/rotate/revoke (`ApiKeysClient`, `API_KEY_ENCRYPTION_SECRET`)
- [ ] Functions: define + run backend logic (`FunctionsPageClient`, BullMQ jobs)

### Phase 7 — Billing, superadmin, docs, notifications
- [ ] Billing: Paystack/Stripe/Flutterwave webhooks + plans (`BillingPageClient`)
- [ ] Superadmin: users, projects, staff, orgs, audit, flags
- [ ] Notifications (`api/internal/notifications`) + read state
- [ ] Docs site (quickstarts, per-service reference)
- [ ] Settings: General, Members, DangerZone

### Phase 8 — Hardening
- [ ] Quotas + rate limiting (Redis)
- [ ] `vitest` unit tests + `playwright` e2e (SSO login, project CRUD)
- [ ] Error/empty/loading states, a11y pass
- [ ] Deploy config + secrets management

---

## Open decisions
- **Auth lib:** keep the current custom OIDC client (works, zero deps) **or**
  migrate to NextAuth v5 with Spurs as a custom OIDC provider (matches reference,
  gives adapters/session helpers). *Recommendation: stay custom until we need adapters.*
- **Mongo:** local `localhost:27017` (needs install) vs MongoDB Atlas (cloud).
- **Multi-tenancy:** schema-per-project vs row-level tenant_id on shared tables.
- **Realtime transport:** socket.io (needs a long-running server, tricky on
  serverless) vs SSE + Redis (serverless-friendly).

## Done this session
Spurs SSO end-to-end wiring verified: `/`→login redirect, `/auth/start`→accounts
`/oauth/authorize` with PKCE, consent fixed (native form). Next: **Phase 1**.
