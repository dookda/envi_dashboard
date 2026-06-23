---
name: envi-dashboard
description: Expert context for the Envi Dashboard project — Next.js config, basePath prefix, database schema, .env variables, Docker services, IoT API parameter codes, and alert pipeline. Use when working in the envi_dashboard repo.
---

# Envi Dashboard — Config & Best Practices

**Stack:** Next.js 15 · Prisma v6 · PostgreSQL · Docker Compose · Auth.js v5 · LINE API  
**Root:** `/Users/sakdahomhuan/Dev/envi_dashboard` · basePath: `/air` · DB: `envi_db`

---

## Next.js basePath `/air`

Next.js auto-injects basePath into `<Link>`, `redirect()`, `router.push()` — never add `/air` manually.  
Must add `/air` manually for: `fetch()`, Auth.js paths, `SessionProvider basePath`, static asset strings.

```ts
<Link href="/dashboard">          // ✅  becomes /air/dashboard
<Link href="/air/dashboard">      // ❌  becomes /air/air/dashboard
fetch('/air/api/stations')        // ✅  fetch needs full path
```

Auth.js exceptions (bypasses Next.js router):
```ts
pages: { signIn: '/air/login' }
redirectTo: '/air/dashboard'
<SessionProvider basePath="/air/api/auth">
```

Next.js 15 — params is a Promise:
```tsx
// client:  const { id } = use(params)
// server:  const { id } = await params
// type:    params: Promise<{ id: string }>
```

API route flags: `export const dynamic = 'force-dynamic'` · `export const maxDuration = 30`  
Map: `dynamic(() => import('@/components/MapComponent'), { ssr: false })`

---

## Environment Variables

Single `.env` at **project root** — never `web/.env`.

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/envi_db` (local) · `@db:5432` (Docker) |
| `AUTH_SECRET` | signing secret |
| `AUTH_GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `NEXTAUTH_URL` / `AUTH_URL` | `http://localhost:3000/air/api/auth` |
| `AUTH_TRUST_HOST` | `true` — set in `docker-compose.yml`, not `.env` |
| `APP_KEY` / `APP_SECRET` | IoT API SHA1 auth |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE API |
| `NEXT_PUBLIC_BASE_PATH` | `/air` — browser-visible |

Rules: `NEXT_PUBLIC_*` = browser-visible · Docker hostname = Compose service name (`db` not `localhost`) · never commit `.env`

```yaml
# docker-compose.yml
web:
  env_file: .env
  environment:
    - AUTH_TRUST_HOST=true
    - DATABASE_URL=postgresql://postgres:postgres@db:5432/envi_db
```

---

## Prisma + PostgreSQL

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]  // Alpine Docker needs linux-musl
}
```

Singleton client (`web/src/lib/prisma.ts`):
```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
```

Schema change workflow (no migrations folder — Docker owns DB):
```bash
# 1. Edit schema.prisma  2. Edit db/init.sql  3. Apply live:
docker exec envi_db psql -U postgres -d envi_db \
  -c 'ALTER TABLE "T" ADD COLUMN IF NOT EXISTS "col" FLOAT NOT NULL DEFAULT 0;'
# 4. Always regenerate:
cd web && npx prisma generate
```

Reading model fields: `pm25` `pm10` `tsp` `windSpeed` `windDirection` `temperature` `humidity`  
Config model: key-value store — `alert.enabled` `alert.pm25=37.5` `alert.pm10=100` `alert.tsp=200` `alert.cooldown=30`

---

## Docker Compose

`depends_on: service_started` = container exists · `service_healthy` = app responds. Always use `service_healthy`.

```yaml
web:
  healthcheck:
    test: ["CMD-SHELL", "wget -qO- http://localhost:3000/air/api/stations || exit 1"]
    interval: 10s  retries: 5  start_period: 30s
cron:
  depends_on:
    web:
      condition: service_healthy
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
  volumes:
    - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql  # runs only on empty volume
```

Stations (seeded): `st-01..06` with real serial numbers and iotCard values in `db/init.sql`.

---

## Auth.js v5

Auth.js does NOT read basePath from `next.config.ts` — Next.js strips prefix before Auth.js sees request.

```ts
// auth.ts — no basePath here
export const { handlers, auth } = NextAuth({
  pages: { signIn: '/air/login' },  // full path required
});
// middleware matcher — paths WITHOUT basePath:
matcher: ['/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)']
```
Google OAuth redirect URI: `http://localhost:3000/air/api/auth/callback/google`

---

## IoT API — HJ212-2017

`POST http://47.236.90.227:57200/api/hj212/querystatus.do?sn=<SN>&tp=2011`  
SHA1 auth — regenerate every request:
```ts
const sig = crypto.createHash('sha1').update(`${ts}_${rand}_${APP_SECRET}`).digest('hex').toUpperCase();
headers: { appkey, timestamp: ts, rand, signature: sig }
```

CODE_MAP (`web/src/lib/enviApi.ts`) — single source of truth:

| Code | Field | Unit |
|------|-------|------|
| `a34004` | `pm25` | µg/m³ |
| `a34002` | `pm10` | µg/m³ |
| `a34001` | `tsp` | µg/m³ |
| `a01007` | `windSpeed` | km/h |
| `a01008` | `windDirection` | ° |
| `a01001` | `temperature` | °C |
| `a01002` | `humidity` | % |

---

## AQ Thresholds (`web/src/lib/airQuality.ts`)

| | Green | Yellow | Red |
|-|-------|--------|-----|
| PM2.5 | ≤20 | ≤37.5 | >37.5 |
| PM10 | ≤50 | ≤100 | >100 |
| TSP | ≤100 | ≤200 | >200 |

`getStatus(level)` → `{ bgColor, textColor, label }` — use inline styles for dynamic cell colors.

---

## Patterns

**Chart timezone** — Docker runs UTC; always pass `timeZone: 'Asia/Bangkok'` to `toLocaleTimeString`.

**LINE alert cooldown** — in-memory Map keyed by stationId; `setCooldown(minutes)` configures duration.

**DB-backed config** — read on every request (not startup) so changes take effect without restart.

**`$queryRaw`** — use for GROUP BY / aggregates; Prisma ORM can't express these cleanly.

---

## Commands

```bash
docker compose up -d                          # start
docker compose up -d --build web              # rebuild after code change
docker compose logs -f cron                   # watch sync
docker exec -it envi_db psql -U postgres -d envi_db
docker exec envi_db psql -U postgres -d envi_db -c 'TRUNCATE TABLE "Reading";'
```
