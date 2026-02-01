# Cart System Architecture & Flow Documentation

This document describes the cart system end‑to‑end, including product configuration rules, guest/auth flows, and data integrity safeguards.

## 1. System Overview

The cart system operates in two modes:

- **Guest Mode**: Stored locally (Zustand + localStorage).
- **Authenticated Mode**: API‑backed cart with sync on load.

Key differences:

- Guest items are **optimistic** and local.
- Auth items are **authoritative** from the backend.

## 2. Core Components

### A) State Management (`src/store/useCartStore.ts`)

Manages:

- `items`: Active cart items (guest or API).
- `pendingItems`: Items that require configuration before they can be merged.
- `isGuestMode`: Decides local vs API operations.
- `isLoading`, `lastSyncedAt`: sync guards.

### B) Stable ID (`src/lib/cart/utils.ts`)

`generateCartItemId` builds deterministic IDs:

- `productId` + `variantId` + `addons` + `customFields` + `notes`
- Prevents duplicate rows when the same configuration is added twice.

### C) Unified Actions (`src/hooks/useCartActions.tsx`)

- `addToCart`: local for guest, API for auth.
- `updateItemQuantity`: local or `PATCH`.
- `removeFromCart`: local or `DELETE`.

## 3. Product Configuration Flow (List vs Detail)

### Listing Add‑to‑Cart

1. User clicks “Add” on a product card.
2. Details are fetched (list is incomplete).
3. If **required** selections exist, a **modal** opens:
   - Required variant
   - Required addon groups (`is_required` or `min_selected > 0`)
   - Required custom fields
4. Optional addons/custom fields are **not shown** in the modal.
5. User can navigate to the product details page for optional selections.

### Product Detail Page

Provides **full** configuration (all addons, all custom fields, notes).

## 4. Guest Flow (Unauthenticated)

1. User adds items → stored locally.
2. Items have stable IDs based on configuration.
3. Price is estimated locally (base + addons).

## 5. Auth Merge Flow (`src/hooks/useCartMerge.ts`)

On login/signup:

1. Guest items are checked for **required selections**.
2. Invalid items are stored in `pendingItems` (not merged).
3. Valid items are transformed and merged to API.
4. `pendingItems` are surfaced as a warning (non‑blocking).

## 6. Auth Sync Flow

When authenticated:

1. `syncWithAPI()` fetches authoritative cart.
2. Local `price` is overwritten from server totals.
3. Sync guard prevents repeated calls within 2 seconds.

## 7. Data Transform Summary

| Field        | Local Source             | API Source                        |
| :----------- | :----------------------- | :-------------------------------- |
| **ID**       | Stable Config ID         | Reconstructed Stable ID           |
| **Price**    | Estimated (Base+Addons)  | Exact (`total_price / quantity`)  |
| **Quantity** | Local increment          | Server count                      |
| **Metadata** | Selection payload        | Reconstructed from API response   |

## 8. Key Files

- `src/store/useCartStore.ts`
- `src/hooks/useCartActions.tsx`
- `src/hooks/useCartMerge.ts`
- `src/lib/cart/utils.ts`
- `src/lib/cart/transform.ts`
- `src/components/modals/ProductConfigModal.tsx`
