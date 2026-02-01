# Product Flow Documentation (Full)

**Goal:** Explain how products are listed, configured, added to cart, and merged after login. This document covers the user flow, the data flow, storage strategy, and why each piece exists.

---

## 1) Business Rules

- List endpoints do **not** include full variant/addon/custom field details.
- If a product requires configuration (variant or required addons/custom fields), users must **configure before add**.
- Only **required** selections are shown in the list modal.
- Optional addons/custom fields stay on the **product detail page**.
- Guests can add items locally; after login, items are merged with the account cart.

---

## 2) API Contracts (Why We Fetch Detail)

List endpoint is lightweight; detail endpoint is authoritative:

- List: `/store/products?page=...`
- Detail: `/store/products/:slug`

Why: list responses don’t include `variants`, `addons`, `custom_fields` in a reliable way, so we only fetch details when the user intends to add/configure.

---

## 3) Data & State Layers

### Local storage
- **Guest cart items** are stored in localStorage via `useCartStore`.

Why: guest users must keep cart between refreshes.

### In-memory (React Query)
- Product detail queries are cached by slug.
- We also store a **short TTL** in localStorage to avoid refetch on immediate revisits.

Why: product details are expensive and should not refetch on every hover/click.

---

## 4) Flow Overview (Step by Step)

### A) Listing Add-to-Cart (Card)
1. User clicks "Add".
2. We fetch product detail by slug.
3. If required configuration exists → open **ProductConfigModal**.
4. If no required config → add directly to cart.

Why: list data is incomplete; we only fetch details when needed.

### B) Product Config Modal
1. Shows only required variants/addons/custom fields.
2. Validates selection.
3. Builds cart payload and adds to cart.
4. Optionally directs users to full product detail for optional extras.

Why: minimal friction for required data, while optional extras stay in full detail UI.

### C) Product Detail Page
- Full configuration (all addons/custom fields/notes).
- Validation for required fields.
- Adds to cart with full payload.

Why: optional configuration belongs in the full product experience.

### D) Guest → Auth Merge
1. On login, we read guest cart.
2. Send a **single** merge request to the backend.
3. Backend smart‑merges items and creates a cart if needed.
4. We sync UI from the returned cart.

Why: backend already provides smart merge behavior. Avoids per‑item requests.

---

## 5) Files and Responsibilities

### UI and UX
- `src/components/ui/ProductCard.tsx`
  - Card UI, add-to-cart button, prefetch hooks.
- `src/components/pages/products/ProductsGrid.tsx`
  - Grid wrapper and add-to-cart wiring.
- `src/components/pages/landing-page/ProductSection.tsx`
  - Landing sections (featured, offers, new arrivals).
- `src/components/pages/products/ProductsMainSection.tsx`
  - Main products page list + filters.
- `src/components/pages/collections/OffersProductsSection.tsx`
  - Offers listing.
- `src/components/pages/categories/CategoryContent.tsx`
  - Category view list.
- `src/components/pages/search/SearchContent.tsx`
  - Search results list.
- `src/components/modals/ProductConfigModal.tsx`
  - Required-only configuration modal.
- `src/components/modals/CartItemConfigModal.tsx`
  - Edit configuration for items already in cart.
- `src/app/[locale]/cart/page.tsx`
  - Cart UI, edit items, loading skeletons.

### Providers and Hooks
- `src/components/providers/ProductConfigProvider.tsx`
  - Global modal instance for all list pages.
- `src/hooks/useProductConfigFlow.ts`
  - Fetch + cache product detail, open modal, prefetch, analytics.
- `src/hooks/useCartActions.tsx`
  - Add/update/remove items for guest or auth.
- `src/hooks/useCartMerge.ts`
  - Merge guest items after login (single request).

### State and Utilities
- `src/store/useCartStore.ts`
  - Cart state, guest mode, pending items.
- `src/lib/products/requirements.ts`
  - Requirement checks and validation helper.
- `src/lib/products/prefetch.ts`
  - Prefetch next page for product lists.
- `src/lib/cart/utils.ts`
  - Stable cart item ID + addon transform.
- `src/lib/cart/transform.ts`
  - Guest cart merge payload transform.
- `src/services/cart-service.ts`
  - Cart API requests.
- `src/services/store-service.ts`
  - Product list and detail endpoints.

### i18n
- `src/messages/en.json`
- `src/messages/ar.json`

---

## 6) What Gets Stored

### Guest Cart Items (localStorage)
- Product id, slug, quantity
- Selected variant id
- Selected addons
- Custom fields
- Notes
 
Why: keep items safe and visible to user after login.

---

## 7) Validation Rules

### Required variant
- If product has variants → must select a variant.

### Required addon groups
- If group is `is_required` or `min_selected > 0` → must satisfy minimum selection.

### Required custom fields
- Any field with `is_required` must be provided.

These are enforced:
- In modal (`ProductConfigModal`)
- In product detail page
- During manual item edits in cart (`CartItemConfigModal`)

---

## 8) Performance Considerations

- Only fetch detail on demand.
- Prefetch on hover/viewport to reduce wait.
- Prefetch **next product page** after list fetch.
- Cache detail in React Query + short localStorage TTL.
- Single modal instance across all pages.
- Track "configure required" vs "direct add" for UX analytics.

---

## 9) Error Handling & UX

- If detail fetch fails → toast error, no modal.
- Cart edit modal shows total price with quantity multiplier.
- Skeletons used for cart loading state.

---

## 10) Related Files (Quick Reference)

- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/cart/page.tsx`
- `src/app/[locale]/category/[[...segments]]/ProductsSection.tsx`
- `src/components/modals/ProductConfigModal.tsx`
- `src/components/modals/CartItemConfigModal.tsx`
- `src/components/pages/categories/CategoryContent.tsx`
- `src/components/pages/collections/OffersProductsSection.tsx`
- `src/components/pages/landing-page/ProductSection.tsx`
- `src/components/pages/products/ProductsGrid.tsx`
- `src/components/pages/products/ProductsMainSection.tsx`
- `src/components/pages/search/SearchContent.tsx`
- `src/components/providers/ProductConfigProvider.tsx`
- `src/components/ui/ProductCard.tsx`
- `src/hooks/useCartActions.tsx`
- `src/hooks/useCartMerge.ts`
- `src/hooks/useProductConfigFlow.ts`
- `src/lib/products/requirements.ts`
- `src/messages/en.json`
- `src/messages/ar.json`
- `src/store/useCartStore.ts`
