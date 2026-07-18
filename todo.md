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

### Phase 1 — App shell & projects ✅ DONE
- [x] `lib/db` — Drizzle client against Neon (`DATABASE_SYNC_URL`) + schema
- [x] Control-plane schema (`spurs` pg schema): `users`, `projects`, `project_members`, `api_keys`
- [x] `drizzle-kit push` to Neon
- [x] Layout: `TopNav`, `Sidebar`, `ProjectSwitcher`, `UserMenu` — **plain Tailwind + lucide (no shadcn)**
- [x] Dashboard home: stat cards + project grid + create-project dialog
- [x] Projects create/delete via **server actions** (`lib/actions/project-actions.ts`) + ownership checks
- [x] Project switcher + `/u/[userId]/project/[projectId]/overview`
- [x] Restructured to reference layout (route groups, `(section_b)`, components-by-feature, `lib/{auth,actions,api,db}`, hooks/stores/types/config)
- ~~ActivityFeed / PlanBanner / `api/internal/projects` REST~~ deferred (server actions cover the UI for now)

### Phase 2 — Database service (SQL) ✅ DONE (core)
- [x] Per-project schema provisioning on Neon (`lib/db/tables.ts` — `schemaName`/`ensureSchema`, injection-safe identifier validation)
- [x] Tables browser (list/create/drop) — `AddTableDialog`, `DatabaseClient` (plain Tailwind)
- [x] Internal API `api/internal/sql/{tables,tables/[table],rows}` + `lib/api/sql-client.ts`; ownership-guarded
- [x] Row CRUD UI (add/list/delete) with typed inputs; engine-agnostic responses
- [x] Verified end-to-end via API (create table → insert → read) against Neon
- [x] **SQL editor** (`api/internal/sql/query`) with result grid — sandboxed per-project **Postgres role** (`SET LOCAL ROLE` + `search_path`); verified it CANNOT read `spurs.*` or other tenants
- [x] **Column alter** — add/drop columns (`tables/[table]/columns`) + UI
- [x] Reusable `Modal` + Modal-based `useConfirm`; confirmation on every delete (row/column/table/file/bucket/project)
- [ ] Public per-table REST (API-key auth) — deferred

### Phase 3 — NoSQL collections
- [ ] `lib/mongo` client
- [ ] Collections + documents CRUD (`api/internal/nosql/*`, `NoSQLPageClient`)
- [ ] JSON document editor + query

### Phase 4 — Storage (buckets) ✅ DONE (core)
- [x] `lib/s3` (S3 client for Backblaze B2) + presigned download URLs; one physical bucket, `${projectId}/${bucket}/` prefixes
- [x] Logical buckets in Postgres (`storage_buckets` table) + `lib/storage.ts` CRUD
- [x] Internal API `api/internal/storage/{buckets,buckets/[id],objects,upload,download}` + `lib/api/storage-client.ts`
- [x] `StorageBrowser` — buckets + file browser (upload via server, list, download, delete); public/private flag
- [x] Verified end-to-end against real B2 (create bucket → upload → list → presigned URL)
- [ ] Public-bucket direct URLs + drag-drop + folders — deferred
> Note: B2 reachability from this machine was flaky (transient DNS/TLS); retries succeed. `STORAGE_BUCKET=proj-maditec-tjltcc-upload` added to `.env`.

### Phase 5 — Realtime ✅ DONE
- [x] Postgres LISTEN/NOTIFY (no Redis needed) — per-table AFTER trigger `pg_notify`s the project channel
- [x] **SSE** stream endpoint (`api/internal/realtime/subscribe`) — `sql.listen` → EventSource (serverless-friendly, no socket.io)
- [x] `RealtimeFeed` — live event feed of row changes; verified end-to-end (insert → event on the stream)
> Triggers are added when a table is created; tables made before this update won't emit until recreated.

### Phase 6 — API keys, public API (Functions/end-user auth deferred)
- [x] **API keys** issue/list/revoke (`lib/apikeys.ts`, `ApiKeysClient` in Settings) — sha256-hashed, secret shown once
- [x] **Public REST API** `api/v1/db/[table]` — API-key auth (`Authorization: Bearer sk_…` / `x-api-key`); GET/POST/DELETE; proxy bypasses session for `/api/v1/*`. Verified: insert+list via key, 401 without.
- [x] **Functions** — define/edit/run; `node:vm` sandbox with a **1s timeout** (verified it kills `while(true)`); console editor + test runner; public invoke `POST /api/v1/functions/<name>`
- [x] **Per-project end-user auth** (auth-as-a-service) — `end_users` table, scrypt hashes, end-user JWTs; public `POST /api/v1/auth/{signup,signin}` + `GET /api/v1/auth/user`; console Users tab
- [x] **Realtime Database** (reshaped from the change-feed per user) — Firebase-style JSON tree; `lib/realtimedb.ts` (one jsonb per project, path get/set/delete + `pg_notify`), live SSE, tree editor UI, public REST `GET/PUT/DELETE /api/v1/rtdb/<path>`

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
