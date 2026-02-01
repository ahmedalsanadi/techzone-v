## Multi-Tenant Frontend Flow (Next.js + Laravel API)

This document explains how the frontend serves multiple stores, how the API resolves tenants, how requests are cached, and how environment variables control behavior. It also lists the key files and the refactored flow so anyone can follow the logic end‑to‑end.

### High-Level Architecture
- One Next.js frontend is shared by all stores.
- The backend (Laravel) resolves the tenant based on the request host or headers.
- The frontend never exposes tenant keys to the browser; tenant resolution happens server‑side.
- Server fetches and the proxy both inject tenant context automatically.

### Backend Tenant Resolution (Laravel)
The backend middleware `ResolveTenant` resolves store context in this order:
1. Subdomain: `store1.example.com` resolves store with `slug = store1`
2. Header: `X-Store-Key` (UUID store_key or slug)
3. Custom domain: optional (if enabled in backend)

If none match, API returns 404 "Store not found".

### Frontend Tenant Resolution (Next.js)
The frontend resolves tenant by request host and injects the store key server‑side only.

Key steps:
1. Read request host from headers (`x-forwarded-host` or `host`).
2. Resolve store key using this order:
   - Domain map (custom domains)
   - Subdomain (for standard tenant subdomains)
   - Default store key (dev only, optional in prod)
3. Use the store key only on the server.

This logic is implemented in:
- `src/lib/tenant.ts`
- `src/lib/tenant/get-tenant.ts`
- `src/lib/tenant/resolve-site.ts`

### Request Flow (Server Fetch)
When a server component calls any service:
1. `fetchLibero` → `fetchLiberoFull` in `src/services/api.ts`
2. `getBaseHeaders` in `src/services/utils.ts` builds headers:
   - `Accept`, `Accept-Language`
   - `X-Store-Key` (server only)
   - `Authorization` for protected routes
   - `x-branch-id` if cookie exists
3. `fetch` is sent directly to the API on server
4. Tenant cache tags are appended automatically (`tenant:<storeKey>`)

### Request Flow (Client Fetch)
When a client component calls any service:
1. Base URL becomes `/proxy`
2. Browser request goes to `src/app/proxy/[...path]/route.ts`
3. Proxy injects `X-Store-Key` based on host (server side)
4. Proxy forwards to backend

This keeps tenant and API key hidden from browser devtools.

### Caching & Revalidation
Cache strategy is centralized in `src/config/cache.ts`.

Key rules:
- Each API call sets `next.revalidate` and tags from `CACHE_STRATEGY` and `CACHE_TAGS`.
- Tenant tag `tenant:<storeKey>` is always added automatically on the server.
- This prevents cross‑tenant cache mixing.

### Dynamic Metadata (SEO)
Tenant-aware metadata is generated per request:
1. `resolveSiteIdentity` reads store config and host origin
2. Returns store name, description, and logo
3. Used in:
   - `src/app/[locale]/layout.tsx` for global metadata
   - Product and offer pages for canonical URLs and OpenGraph

### Sitemap
`src/app/sitemap.ts` now:
- Uses tenant‑specific base URL
- Includes static routes + products + categories + CMS pages
- Ensures correct indexing per tenant host

### Environment Variables
These are the active variables after refactor:

#### Required
- `LIBERO_API_KEY`
  - Server-only API key used by the proxy and server fetches.
  - Must never be exposed to browser.

- `NEXT_PUBLIC_API_URL`
  - Base URL for backend API.
  - Server uses it directly. Client uses `/proxy`.

- `NEXT_PUBLIC_SITE_URL`
  - Default site URL (used as fallback).

#### Tenant Resolution
- `STORE_DOMAIN_MAP`
  - JSON map for custom domains.
  - Example: `{"store1.com":"store1","store2.com":"store2"}`

- `STORE_DEFAULT_KEY`
  - Dev-only fallback store key (slug or UUID).
  - Use only when running on localhost without subdomains.

- `ALLOW_DEFAULT_STORE_KEY_IN_PROD`
  - If `true`, allows default store key in production.
  - Keep `false` for proper tenant isolation.

- `ALLOW_DEFAULT_STORE_KEY_ON_PLATFORM_HOSTS`
  - If `true`, allows default store key when running on platform hosts like `*.vercel.app`.
  - Useful for production preview deployments without custom domains.

### File Map (Refactored)
Tenant resolution:
- `src/lib/tenant.ts` (parsing host → store key)
- `src/lib/tenant/get-tenant.ts` (origin + host info)
- `src/lib/tenant/resolve-site.ts` (store identity for metadata)

Metadata:
- `src/app/[locale]/layout.tsx` (dynamic metadata)
- `src/lib/metadata.ts` (structured data)
- `src/app/[locale]/products/[slug]/page.tsx`
- `src/app/[locale]/offers/page.tsx`

Request/Proxy:
- `src/services/api.ts`
- `src/services/utils.ts`
- `src/app/proxy/[...path]/route.ts`
- `src/proxy.ts`

Caching:
- `src/config/cache.ts`
- `src/services/store-service.ts`
- `src/services/store-config.ts`

Sitemap:
- `src/app/sitemap.ts`

Branch Cookies:
- `src/lib/branches/cookies.ts`

### End-to-End Flow Example
1. User opens `https://pizza.example.com`
2. Next.js reads `host = pizza.example.com`
3. Tenant resolver uses subdomain `pizza`
4. Server fetch injects `X-Store-Key: pizza`
5. Backend resolves tenant by slug `pizza`
6. Store config, categories, CMS pages are fetched and cached
7. Layout injects store theme + tenant metadata
8. Subsequent client fetches go through `/proxy` and are tenant‑safe

### Dev Example (localhost)
1. User opens `http://localhost:3000`
2. Host has no subdomain
3. `STORE_DEFAULT_KEY=fasto` is used
4. Backend resolves tenant by header `X-Store-Key: fasto`

### Production Example (custom domain)
1. User opens `https://store1.com`
2. `STORE_DOMAIN_MAP` maps `store1.com → store1`
3. Proxy/server fetch injects `X-Store-Key: store1`
4. Backend resolves tenant by header and returns correct data
