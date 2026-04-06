# Store — Multi-Tenant Frontend

Next.js frontend for a multi-tenant restaurant/store platform. One app serves many stores; tenant is resolved server-side by host (subdomain or domain map). API key and store key are never exposed to the browser.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, next-intl (ar/en), Zustand, TanStack Query.

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Project structure](#project-structure)
- [Critical flows](#critical-flows)
- [Where to find things](#where-to-find-things)
- [Environment variables](#environment-variables)
- [Conventions](#conventions)
- [Related docs](#related-docs)

---

## Architecture overview

- **One Next.js app** serves all stores. The backend (Laravel) resolves tenant by `X-Store-Key` header (or subdomain).
- **Client requests** go to `/proxy`; the proxy injects `X-Store-Key` and forwards to the API. **Server requests** call the API directly with the same headers. See [Critical flows](#critical-flows).
- **Host resolution:** Always use `x-forwarded-host` (first value) or `host` when resolving tenant, so it works behind reverse proxies (e.g. Vercel).
- **Store config, categories, CMS pages:** Fetched once per request in the root layout via `getServerStoreConfig`, `getStoreCategories`, `getStorePages` in `src/services/store-config.ts`. If the API is unreachable, the app shows a fallback UI and logs a short warning in dev.

---

## Project structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # All routes are under locale (ar, en)
│   │   ├── layout.tsx      # Root layout: store config, theme, providers
│   │   ├── (protected)/    # Auth-required routes: checkout, profile, wallet, my-addresses, my-orders
│   │   ├── auth/           # Login / OTP
│   │   ├── cart/, checkout (public cart page), products/, categories/, category/, offers/, search/
│   │   ├── my-orders/, contact/, pages/ (CMS), faq/, terms/, wishlist/
│   │   └── ...
│   ├── proxy/[...path]/    # API proxy: client requests hit here, then get forwarded to env.apiUrl
│   │   └── route.ts
│   ├── globals.css
│   └── sitemap.ts
│
├── components/             # UI by feature/layout, not by page
│   ├── auth/               # AuthContainer, RouteGuard
│   ├── checkout/           # OrderTypeCard, PaymentMethodCard, CouponCard, OrderSummaryCard, etc.
│   ├── contact/            # ContactForm, SocialMediaChannels, BranchWarning, etc.
│   ├── landing/            # HeroSlider, CategorySection, ProductSection, LandingPage
│   ├── layouts/            # Navbar, Footer, PageContainer, CartDropdown, UserMenu, ToasterContainer, etc.
│   ├── modals/             # BranchSelectionModal, AddressModal, ProductConfigModal, CartItemConfigModal, etc.
│   ├── offers/             # OffersView, CollectionCard, OffersProductsSection
│   ├── orders/             # MyOrdersView, OrderDetailsView, OrderCard, ReportProblemView, etc.
│   ├── products/           # ProductDetails, product-details/* (gallery, addons, reviews, etc.)
│   ├── providers/          # StoreProvider, ThemeProvider, QueryProvider, ProductConfigProvider, ThemeStyles
│   ├── search/             # SearchContent
│   └── ui/                 # Shared primitives: Button, Input, Breadcrumbs, ProductCard, CategoryCard, etc.
│
├── config/                 # App and env config (no business logic)
│   ├── env.ts              # Single source for env vars (apiUrl, siteUrl, tenant flags, etc.)
│   ├── cache.ts            # Cache strategy and tags for API
│   ├── footer.ts           # Footer sections, badges, social links
│   ├── navigation.ts       # Nav items
│   └── site.ts             # Default site metadata
│
├── data/                   # Static/mock data
│   └── mock-data.ts        # Used by FigmaDesign, ProductAllergies, etc.
│
├── hooks/                  # By domain; each domain has index.ts barrel
│   ├── address/            # useAddresses, useAddressMerge, useAddressForm, useAddressFlow
│   ├── auth/               # useAuthFlowHandlers, useAuthProfileLoader, useAuthFlowValidation, useOtpTimer
│   ├── branch/             # useBranchSelection
│   ├── cart/               # useCartActions, useCartMerge
│   ├── checkout/           # useCheckoutInit, useCreateOrder, usePaymentStatus, useCheckout (barrel: index.ts)
│   ├── offers/             # useOffersView
│   ├── products/           # useProductConfigFlow, useUrlFilters
│   ├── ui/                 # useModalKeyboard
│   └── wishlist/           # useWishlistActions, useWishlistMerge
│
├── i18n/                   # next-intl
│   ├── routing.ts          # locales: ar, en; defaultLocale: ar
│   ├── navigation.ts       # Link / useRouter wrappers
│   ├── request.ts          # getRequestConfig
│   └── setup-locale.ts     # validate locale for static generation
│
├── lib/                    # Pure utils, API client, tenant, domain helpers (no React)
│   ├── api/                # API client and headers
│   │   ├── client.ts       # fetchLibero, fetchLiberoFull, getBaseUrl, ApiError
│   │   ├── headers.ts     # getBaseHeaders (X-Store-Key, x-branch-id, Authorization)
│   │   ├── errors.ts       # getApiErrorMessage
│   │   └── index.ts
│   ├── tenant/             # Tenant resolution (client-safe exports in index.ts)
│   │   ├── resolve.ts     # resolveTenant, resolveStoreKeyFromHost, parseDomainMap (host → store key)
│   │   ├── get-tenant.ts  # getRequestHost, getTenantContext (uses next/headers — server only)
│   │   ├── resolve-site.ts # resolveSiteIdentity for metadata (server)
│   │   └── index.ts       # Re-exports only from resolve.ts (safe for client bundles)
│   ├── auth/               # AUTH_COOKIES, storage, cookies, utils, error-handler
│   ├── branches/           # BRANCH_COOKIES, cookies, map-utils, utils
│   ├── cart/               # transform, utils (e.g. generateCartItemId)
│   ├── checkout/           # orderTypeToFulfillment, buildCreateOrderPayload, buildSummaryItems, parsePaymentResult
│   ├── utils/              # cn, formatCurrency, isValidColor, normalizeRedirectPath
│   ├── theme-utils.ts      # isValidColor, generateThemeVariables (for StoreProvider / ThemeStyles)
│   ├── getQueryClient.ts
│   ├── metadata.ts
│   ├── sanitize.ts
│   └── address/, contact/, products/, wishlist/  # Domain helpers (formatAddress, geocoding, prefetch, etc.)
│
├── messages/               # next-intl JSON (ar.json, en.json)
│
├── services/               # API-facing layer (all use lib/api and lib/tenant)
│   ├── index.ts            # Barrel: re-exports all services
│   ├── store-config.ts     # getStoreConfig, getStoreCategories, getStorePages, getServerStoreConfig (cached)
│   ├── store-service.ts   # getConfig, getCategories (used by store-config and client)
│   ├── auth-service.ts
│   ├── branch-service.ts
│   ├── cart-service.ts
│   ├── cms-service.ts
│   ├── order-service.ts
│   ├── review-service.ts
│   ├── wallet-service.ts
│   └── wishlist-service.ts
│
├── store/                  # Zustand stores
│   ├── index.ts            # Barrel: useCartStore, useOrderStore, useAuthStore, useAddressStore, etc.
│   ├── useCartStore.ts
│   ├── useOrderStore.ts
│   ├── useAuthStore.ts
│   ├── useAddressStore.ts
│   ├── useBranchStore.ts
│   ├── useWishlistStore.ts
│   └── useUiStore.ts
│
└── types/                  # By domain; each has *.types.ts and index.ts
    ├── api/                # ApiResponse, PaginationMeta
    ├── store/              # StoreConfig, Category, CMSPage, theme, etc.
    ├── address/, auth/, cart/, orders/, reviews/, wallet/, wishlist/, branches/
    └── ...
```

---

## Critical flows

### API requests: client vs server

- **Server (RSC / SSR):** `getBaseUrl()` returns `env.apiUrl` (e.g. `https://store-api.libro-shop.com/api/v1`). `fetch` goes **directly** to the API. Headers are built in `getBaseHeaders()` in `src/lib/api/headers.ts` (X-Store-Key from request host, x-branch-id from cookies).
- **Client (browser):** `getBaseUrl()` returns `'/proxy'`. Request goes to the same origin (`/proxy/store/...`). `src/app/proxy/[...path]/route.ts` receives it, injects **X-Store-Key** (from `resolveTenant(host)` using request host) and **x-branch-id** (from request cookies), then forwards to `env.apiUrl + path`.

So: **client → proxy → API**; **server → API** directly. Never send the API base URL or store key to the browser.

### X-Store-Key and x-branch-id

| Header        | Client (browser) | Server |
|---------------|------------------|--------|
| **X-Store-Key** | Not set in browser. **Proxy** injects it using `resolveTenant(host)` from the request’s `x-forwarded-host` or `host`. | Set in `getBaseHeaders()` (host from request headers → `resolveTenant(host)`). |
| **x-branch-id** | Set in `getBaseHeaders()` from `document.cookie` so the request to `/proxy` carries it; proxy forwards it to the API. | Set in `getBaseHeaders()` from `cookies()` (Next request cookies). |

### Tenant resolution

- Host is always taken as: **`x-forwarded-host` (first value) or `host`** (same in `store-config`, `lib/api/headers.ts`, and proxy route).
- Resolution order: domain map → subdomain → default store key (dev / when allowed). Implemented in `src/lib/tenant/resolve.ts`; server-only helpers (e.g. `getRequestHost`) in `src/lib/tenant/get-tenant.ts`.
- **Do not** import `get-tenant` or `resolve-site` from `@/lib/tenant` in client code; use `@/lib/tenant` (index) which only re-exports from `resolve.ts`.

### Store config and layout

- Root layout (`src/app/[locale]/layout.tsx`) calls `getServerStoreConfig()`, `getStoreCategories()`, `getStorePages()` in parallel. These use `store-config.ts`, which uses the same host resolution and returns `null`/`[]` on API failure (with a single-line warning in dev).
- Layout renders `ServiceUnavailableFallback` when `storeConfig` is null; otherwise injects theme and `StoreProvider` with config, categories, and cmsPages.

### Checkout and orders

- Checkout logic (payload building, summary, result parsing) lives in **`src/lib/checkout/index.ts`** (not in app folder). Pages under `app/[locale]/(protected)/checkout/` and `checkout/result` import from `@/lib/checkout`.
- Order list/detail and report-problem UI live in **`src/components/orders/`** (MyOrdersView, OrderDetailsView, ReportProblemView). App routes under `my-orders` use these components.

---

## Where to find things

| Task | Where to look |
|------|----------------|
| Add or change an API call | `src/services/*.ts` (use `fetchLibero` / `fetchLiberoFull` from `@/lib/api`). |
| Change request headers (tenant, branch, auth) | `src/lib/api/headers.ts` (and proxy route for client path). |
| Tenant / host resolution | `src/lib/tenant/resolve.ts`, `get-tenant.ts`; doc: `docs/TENANCY_FRONTEND_FLOW.md`. |
| Store config / categories / CMS on load | `src/services/store-config.ts`; consumed in `src/app/[locale]/layout.tsx`. |
| Checkout payload, summary, result parsing | `src/lib/checkout/index.ts`. |
| Auth (login, OTP, guards) | `src/lib/auth/`, `src/hooks/auth/`, `src/components/auth/`, `src/services/auth-service.ts`. |
| Cart state and sync | `src/store/useCartStore.ts`, `src/hooks/cart/`, `src/lib/cart/utils.ts`. |
| Branch selection and cookies | `src/store/useBranchStore.ts`, `src/hooks/branch/`, `src/lib/branches/`, proxy and headers for `x-branch-id`. |
| Theme / store branding | `src/config/env.ts` (no theme here), `StoreProvider` + `ThemeStyles` in layout; theme comes from store config. |
| i18n (locales, messages) | `src/i18n/routing.ts` (ar, en), `src/messages/*.json`, use `useTranslations`, `Link`/`useRouter` from `@/i18n/navigation`. |
| Shared UI (buttons, cards, inputs) | `src/components/ui/`. |
| Types for API or domain | `src/types/` (by domain: api, store, orders, cart, auth, etc.). |
| Env vars and defaults | `src/config/env.ts`. |

---

## Environment variables

Centralized in **`src/config/env.ts`**. Used by API client, proxy, tenant resolution, and store config.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL (e.g. `https://store-api.libro-shop.com/api/v1`). Server and proxy use this; client never sees it. |
| `NEXT_PUBLIC_SITE_URL` | Default site URL (fallback for metadata, etc.). |
| `LIBERO_API_KEY` or `NEXT_PUBLIC_LIBERO_API_KEY` | Server-only preferred; used for auth/API when needed. |
| `STORE_DEFAULT_KEY` | Dev fallback store key when host has no subdomain. |
| `STORE_DOMAIN_MAP` | JSON map of custom domains to store keys, e.g. `{"store1.com":"store1"}`. |
| `ALLOW_DEFAULT_STORE_KEY_IN_PROD` | If `true`, allows default store key in production. |
| `ALLOW_DEFAULT_STORE_KEY_ON_PLATFORM_HOSTS` | If `true`, allows default store key on platform hosts (e.g. `*.vercel.app`). |

---

## Conventions

- **Imports:** Prefer `@/` aliases: `@/lib/api`, `@/services/store-config`, `@/hooks/checkout`, `@/types/orders`, `@/components/checkout`, `@/store`, `@/config/env`.
- **Types:** Use domain types from `@/types/*` (e.g. `@/types/store`, `@/types/orders`). No `services/types`; that was removed in favor of `types/`.
- **Hooks:** Import from domain barrels, e.g. `@/hooks/checkout` (useCheckoutInit, useCreateOrder), `@/hooks/auth`, `@/hooks/cart`.
- **Utils:** `cn`, `formatCurrency`, `normalizeRedirectPath` from `@/lib/utils`. |
- **Redirect path normalization:** Use `normalizeRedirectPath` from `@/lib/utils` (re-exported from `lib/utils/redirect`). |
- **Server-only:** Do not import `get-tenant` or `resolve-site` in client components; use `@/lib/tenant` for client-safe tenant helpers only. |

---

## Related docs

- **`docs/TENANCY_FRONTEND_FLOW.md`** — Multi-tenant flow, request paths, header injection, caching, env vars, and file map. Read this when working on tenant, proxy, or API request behavior.

---

## Recent refactor & hardening (Products list + cache safety)

This section documents the main changes made to the **Products listing/filtering/pagination** flow and the cross-cutting **cache-safety** work (tenant + branch + locale).

### Goals

- **Zero cross-tenant leaks**: cached data must never bleed between stores.
- **Branch-safe & locale-safe**: switching branch/locale must not show stale products.
- **URL-driven UX**: filters and pagination should be shareable, refresh-safe, and back/forward friendly.
- **Smooth pagination** without UI lies (no “page 1” indicator while showing page 2 results).
- **Strong UX feedback**: skeletons and background “updating” states instead of flashing/jank.

### Multi-tenancy + branch context (what we standardized)

- **Tenant**: derived from request host (`x-forwarded-host` first value, fallback `host`).
- **Branch**: derived from `BRANCH_COOKIES.BRANCH_ID` and/or `useBranchStore`.
- **Locale**: from `next-intl` (`useLocale` / server params).

These values are treated as **part of the query cache identity** for product-related data.

### React Query cache safety (tenant + branch + locale)

We introduced a products listing query context:

- **`tenantHost`**
- **`locale`**
- **`branchId`** (or stable `'no-branch'`)

Key files:

- `src/lib/products/listing/queryKeys.ts` — stable, context-aware keys + stable serialization (incl. canonical ordering for primitive arrays).
- `src/lib/products/listing/queries.ts` — query options for products + filter vars.
- `src/hooks/products/useProductConfigFlow.ts` — product detail prefetch/fetch is also context-aware.

Why this matters:

- Without it, React Query can serve **valid cached data for the wrong tenant/branch/locale**.

### Removed unsafe localStorage product caching

We removed previous product-detail caching in `localStorage` (tenant/branch/locale unsafe).

Replacement:

- **React Query in-memory cache** + prefetch, with context-aware keys.

### Products page is SSR-initialized + hydrated

The products list page now does an initial server prefetch and hydrates TanStack Query:

- `src/app/[locale]/products/(list)/page.tsx`
  - Parses `searchParams` → state
  - Resolves `tenantHost` from request headers and `branchId` from cookies
  - Prefetches:
    - products list
    - filters vars (conservative args)
  - Wraps client view in `HydrationBoundary`
  - SEO:
    - canonical is locale-aware
    - filtered/paginated variants are `noindex`

### URL-driven filters + pagination (refresh/back/share works)

The page state is derived from the URL and updates the URL on user actions:

- `src/lib/products/listing/listing-state.ts`
  - `productsPageStateFromUrlParams`
  - `productsPageStateToUrlParams`
  - `buildProductsListParams` (canonicalizes arrays + attributes)

Important implementation rule:

- When a filter becomes empty (e.g. last category removed), we must **delete** stale query keys from the URL; otherwise URL→state sync will re-apply old filters.

### Pagination UX correctness (no placeholder mismatch)

We keep previous results **only** for pure page changes. Filter changes do a real refresh (skeletons / updating state).

Key file:

- `src/components/products/listing/ProductsPageClient.tsx`

### Applied filters UI + attribute filters

- Applied filter “chips” with per-filter removal and Clear All:
  - `src/components/products/listing/AppliedFiltersBar.tsx`
- Dynamic attributes rendering in the sidebar (from API filters vars):
  - `src/components/products/listing/ProductsFiltersSidebar.tsx`

### Availability semantics

Availability is single-choice (radio semantics) with an “All” option.

### UI event correctness: Checkbox double-toggle fix

We fixed a subtle UI bug where the checkbox could toggle twice (native `<label>` toggling + wrapper click handler).

- `src/components/ui/CheckboxField.tsx`

Rule of thumb:

- The real `<input>` should be the single source of truth for toggling. Avoid extra wrapper `onClick` toggles.

### i18n cleanup

We removed hardcoded strings in the products filtering UI and standardized translation namespace usage.

Key files:

- `src/messages/en.json`, `src/messages/ar.json`
- `src/components/ui/Pagination.tsx`
- `src/components/products/listing/*` (listing UI modules next to `ProductsPageClient`)

### How to test quickly (manual QA)

- **Deep link**: open `/ar/products?category_id=1&page=2&per_page=8` and confirm:
  - page loads with correct filters applied
  - pagination indicator matches results
- **Pagination**: click page 2/3 quickly:
  - should not jump back to page 1
  - should show “Updating results…” (dim state) rather than UI flashing
- **Toggle off last filter** (e.g. last category):
  - checkbox should remain unchecked
  - URL should remove `category_id`
- **Branch switch**:
  - product list + product details must not show stale branch data
- **Locale switch**:
  - no stale language content from cache

---

## Quick start

```bash
npm install
cp .env.example .env   # if present; set NEXT_PUBLIC_API_URL, STORE_DEFAULT_KEY, etc.
npm run dev
```

Open the app (e.g. `http://localhost:3000`). With no subdomain, `STORE_DEFAULT_KEY` is used for `X-Store-Key`. For LAN access from another device, add that host to `allowedDevOrigins` in `next.config.ts`.
