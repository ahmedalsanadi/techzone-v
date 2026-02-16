# Multi-Tenancy Isolation & Caching Strategy

This document explains how the application ensures data isolation, security, and performance across multiple tenants (stores) while sharing the same codebase and backend API.

---

## 1. Server-Side Data Isolation (Next.js Data Cache)

### The Challenge

Next.js caches `fetch` requests on the server to improve performance. By default, it uses the **Request URL** as the primary cache key. In a multi-tenant setup where all tenants call the same backend API (e.g., `api.libero.com/store/config`), Next.js might "accidentally" serve Tenant A's cached configuration to Tenant B.

### The Solution: URL Differentiation

We use a technique called **URL Salt/Busting**. Every API request made on the server automatically appends the unique `storeKey` (slug) as a query parameter.

**Technical Implementation (`src/lib/api/client.ts`):**

```typescript
if (typeof window === 'undefined') {
    const { storeKey } = resolveTenant(host);
    if (storeKey) {
        url.searchParams.set('_t', storeKey); // Forces a unique cache entry per tenant
    }
}
```

**Resulting Cache Keys:**

- Tenant 1: `https://api.libero.com/store/products?_t=alsanadi` -> **Entry A**
- Tenant 2: `https://api.libero.com/store/products?_t=fasto` -> **Entry B**

Even though the API ignores the `_t` parameter, Next.js effectively creates a strict "Wall of Isolation" in the file-system cache.

---

## 2. Granular Cache Control (Tags & Revalidation)

### Centralized Management (`src/config/cache.ts`)

Instead of hardcoding tags and times scattered across the project, we centralize them in one place.

### Isolation via Tags

Every request is tagged with a tenant-specific identifier. This allows us to clear the cache for one specific store (e.g., if they updated their theme) without affecting anyone else.

**Example Tagging Structure:**

- **Tenant Tag**: `tenant:{storeKey}` (e.g., `tenant:alsanadi`)
- **Resource Tag**: `products`, `categories`, `cms-pages`

**Why this matters:** If you want to clear the cache for **only** one store, you simply call: `revalidateTag('tenant:alsanadi')`

---

## 3. Client-Side Isolation (Local Storage & Zustand)

### Scenario: The "Shared Domain" Risk

Most isolation is handled by the browser's **Same-Origin Policy**. `store1.com` cannot see `store2.com`'s data. However, for development on `localhost` or for stores sharing a parent domain (e.g., `s1.libero.com` and `s2.libero.com`), the browser might share Local Storage or Cookies.

### The "Safety Lock" Strategy

We implemented a custom validation layer in our persistent stores (`Cart`, `Auth`, `Wishlist`, `Branch`).

**How it works:**

1. **The Stamp**: When data is saved, we save the current `tenantHost` alongside it.
2. **The Verification**: During hydration (when the page loads), the store compares its saved host with the current browser host.
3. **The Reset**: If they don't match, the store immediately wipes the data to prevent leakage.

**Example Flow:**

1. User visits `pizzehub.libero.com` -> Cart saved with `tenantHost: pizzehub.libero.com`.
2. User visits `burgerbar.libero.com` (sharing a domain).
3. `useCartStore` loads the data but sees the host mismatch.
4. **Action**: `merge()` logic kicks in, clears the cart, and provides a fresh state for Burger Bar.

---

## 4. TanStack Query (Browser Memory)

TanStack Query stores data in browser RAM. Because different domains (even subdomains) run in separate processes or sandboxed contexts in modern browsers, memory leakage is physically impossible at the OS level.

---

## Summary of Isolation

| Level | Technology | Key Isolation Mechanism |
| :-- | :-- | :-- |
| **Backend API** | Headers | `X-Store-Key` injected by Server/Proxy |
| **Server Cache** | Next.js Fetch | `?_t={storeKey}` URL separation |
| **Frontend RAM** | TanStack Query | Browser Sandboxing |
| **Persistent Storage** | Local Storage | `tenantHost` Stamp + Browser Origin |
| **Auth** | Cookies | Domain-locked cookies + `tenantHost` lock |

This multi-layered approach ensures that no matter how or where the user visits a store, their data remains strictly private and relevant to that specific tenant.
