@AGENTS.md

---

# Project Guidelines

Follow these rules before creating any new feature, page, or component.

---

## App Name & Identity

**App name:** Envir Service  
**Subtitle:** Environmental Quality Control Terminal

---

## Route Structure

| Browser URL | File | Access |
|---|---|---|
| `/air/` | `src/app/page.tsx` | redirects → `/air/dashboard` |
| `/air/dashboard` | `src/app/dashboard/page.tsx` | protected (requires auth) |
| `/air/login` | `src/app/login/page.tsx` | public |
| `/air/api/auth/[...]` | `src/app/api/auth/[...nextauth]/route.ts` | public (Auth.js handler) |
| `/air/api/stations` | `src/app/api/stations/route.ts` | server |
| `/air/api/readings` | `src/app/api/readings/route.ts` | server |

Next.js `basePath` is `/air` — all routes are prefixed automatically. Never add `/air` manually to Next.js `Link`, `redirect()`, or `router.push()` calls. Auth.js paths and `redirectTo` values DO need the full `/air/...` prefix because Auth.js bypasses the Next.js router.

---

## Authentication (Auth.js v5 / next-auth@beta)

**Provider:** Google OAuth only  
**Library:** `next-auth@beta` (v5)  
**Config file:** `src/auth.ts`  
**Middleware:** `src/middleware.ts`

### Key rules
- `basePath` is NOT set in `auth.ts` — Next.js strips `/air` before the handler sees the URL, so Auth.js uses the default `/api/auth`.
- Auth.js page redirects use full paths: `pages.signIn: '/air/login'`, `redirectTo: '/air/dashboard'`.
- `AUTH_URL=http://localhost:3000/air/api/auth` tells Auth.js the full public URL for generating OAuth callback URIs.
- `NEXTAUTH_URL=http://localhost:3000/air/api/auth` is baked into the client bundle (via `next.config.ts`) so `SessionProvider` knows where to fetch the session.
- `SessionProvider` must always receive `basePath="/air/api/auth"`.
- Cookies are explicitly configured with `secure: false`, `sameSite: 'lax'`, `path: '/'` for HTTP / Docker.

### Middleware matcher
The matcher uses paths **without** the `basePath` prefix (Next.js strips it before matching):
```ts
matcher: ['/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)']
```
This protects all routes except the login page and Auth.js API routes.

### Google Console redirect URI
```
http://localhost:3000/air/api/auth/callback/google
```

### Components
- `src/components/SignOutButton.tsx` — client component, calls `signOut({ callbackUrl: '/air/login' })`.

---

## Environment Variables

Stored in root `.env` (one file for the whole project). `web/.env` does not exist.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres — use `localhost:5432` locally, `db:5432` in Docker |
| `AUTH_SECRET` | Auth.js signing secret |
| `AUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXTAUTH_URL` | `http://localhost:3000/air/api/auth` — baked into client bundle |

Docker adds `AUTH_TRUST_HOST=true` and `AUTH_URL=http://localhost:3000/air/api/auth` at runtime via `docker-compose.yml`.

---

## UI Theme — Google Material Design inspired

### Color Tokens (`globals.css` CSS variables)

Always use CSS variables or the exact hex values below. Do not introduce new colors.

| Token | Light | Dark |
|---|---|---|
| `--background` | `#f8f9fa` | `#202124` |
| `--foreground` | `#202124` | `#e8eaed` |
| `--card` | `#ffffff` | `#2d2e30` |
| `--border` | `#e8eaed` | `#3c4043` |
| `--muted` | `#f1f3f4` | `#303134` |
| `--muted-foreground` | `#5f6368` | `#9aa0a6` |
| `--primary` | `#1a73e8` | `#8ab4f8` |

### Semantic palette (hardcoded hex, not variables)

| Meaning | Bg | Text | Accent |
|---|---|---|---|
| Blue / Info | `#e8f0fe` | `#1a73e8` | `#1a73e8` |
| Green / Good | `#e6f4ea` | `#137333` | `#34a853` |
| Yellow / Moderate | `#fef3c7` | `#b45309` | `#fbbc04` |
| Red / Danger | `#fce8e6` | `#c5221f` | `#ea4335` |
| Gray / Offline | `#f1f3f4` | `#5f6368` | `#5f6368` |

### Typography

- **Font stack:** `'Google Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Page title: `text-lg font-semibold`
- Section heading: `font-semibold text-sm`
- Body / list items: `text-sm`
- Meta / labels: `text-xs` muted color
- Tiny badge labels: `text-[10px] font-semibold` or `text-[9px] font-medium`

### Border Radius Scale

| Context | Class |
|---|---|
| Page sections, cards, panels | `rounded-3xl` |
| Buttons, card rows, inner panels | `rounded-2xl` |
| Small data cells | `rounded-xl` |
| Pill chips, badges, status tags | `rounded-full` |

---

## Common UI Patterns

### Card / Panel
```tsx
<div className="bg-card px-5 py-5 rounded-3xl border border-border">
  ...
</div>
```
Wide header cards use `px-6 py-4`. Always `border border-border`, never box-shadow.

### Icon + label header
```tsx
<div className="p-2 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl">
  <Icon className="h-5 w-5" />
</div>
<div>
  <h3 className="font-semibold text-[#202124] dark:text-[#e8eaed]">Title</h3>
  <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Subtitle</p>
</div>
```

### Pill chip (status / meta)
```tsx
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] text-xs font-medium">
  <Icon className="h-3.5 w-3.5" />
  <span>Label</span>
</div>
```

### Data cell (metric badge)
```tsx
<div className="bg-[#e8f0fe] p-1.5 rounded-xl text-center">
  <span className="block text-[9px] font-medium text-[#1a73e8]">PM2.5</span>
  <span className="text-xs font-semibold text-[#1a73e8]">{value}</span>
</div>
```

### Clickable list row
```tsx
<button className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150
  ${isActive
    ? 'bg-[#f1f3f4] dark:bg-[#303134]'
    : 'bg-transparent hover:bg-[#f8f9fa] dark:hover:bg-[#303134]/60'}`}>
```

---

## Layout

- Max width: `max-w-7xl mx-auto`
- Page padding: `p-4 md:p-8`
- Section spacing: `space-y-5` or `gap-5`
- Primary grid: `grid grid-cols-1 lg:grid-cols-3 gap-5` (1/3 sidebar · 2/3 content)

---

## PM2.5 AQI Thresholds

| Level | Condition | Palette |
|---|---|---|
| Good | ≤ 12 | green |
| Moderate | ≤ 35.4 | yellow |
| Sensitive | ≤ 55.4 | orange/red |
| Unhealthy | > 55.4 | red |
| Offline | `null` / `undefined` | gray |

Use `getPM25Status()` in `dashboard/page.tsx` — do not duplicate this logic.

---

## Tech Stack Constraints

| Concern | Choice |
|---|---|
| Map | MapLibre GL JS (`maplibre-gl`), CARTO Voyager raster tiles — no Leaflet |
| Charts | Recharts only |
| Icons | Lucide React only |
| Styling | Tailwind CSS v4 + CSS variables in `globals.css` |
| Auth | Auth.js v5 (`next-auth@beta`), Google provider only |
| Map import | Always `dynamic(() => import(...), { ssr: false })` |
| Dark mode | `prefers-color-scheme` media query via CSS variables — no JS toggle |
| DB ORM | Prisma (`@prisma/client`) |
