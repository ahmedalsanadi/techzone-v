## Customer Address Flow (Production Guide)

**Version:** 4.0 | **Status:** Production Ready | **Date:** Feb 1, 2026

This document explains the address flow end‑to‑end: business rules, data contracts, UI/UX behavior, performance decisions, and where each part lives.

---

## 1) Business Rules (Non‑Negotiable)

- Guests can store **one** address locally.
- After login/signup, the guest address is **merged** into the account.
- Auth users can create, edit, delete, and set default addresses.
- UI always uses a **normalized** address shape regardless of source.

---

## 2) API Contract (Backend Shape)

Endpoints

- `POST /store/addresses` (create)
- `GET /store/addresses` (list)
- `GET /store/addresses/:id` (single)
- `PUT /store/addresses/:id` (update)
- `DELETE /store/addresses/:id` (delete)

Important fields (snake_case):

- `building_number`, `unit_number`, `notes`
- `country_id`, `city_id`, `district_id`
- `latitude`, `longitude`

---

## 3) Directories & File Responsibilities

### `src/types/address.ts`
- Defines `Address`, `AddressFormSubmitPayload`, and request types.
- `normalizeAddress` maps raw/legacy shapes to one consistent model.
- `toCreateAddressRequest` / `toUpdateAddressRequest` map UI payload to API shape.

### `src/services/store-service.ts`
- All address API calls (create/update/delete/list/single).

### `src/hooks/useAddresses.ts`
- React Query layer.
- Normalizes **all** list/single results in the cache.
- Optimistic updates with rollback on error.
- Consistent cache updates (no unnecessary refetches).

### `src/hooks/address/useAddressFlow.ts`
- Facade for UI.
- Decides auth vs guest behavior.
- Exposes `addresses`, `isLoading`, `isError`, `refetch`, `saveAddress`, `deleteAddress`, `setDefault`.

### `src/store/useAddressStore.ts`
- Guest address storage (persisted).
- Normalizes on set and migration.

### `src/store/useOrderStore.ts`
- Active delivery address (persisted).
- Normalizes on set and migration.

### `src/hooks/useAddressMerge.ts`
- Merge guest address on auth.
- Dedupes by location + street (+ building/unit when available).
- Uses the same mutation pipeline as normal creates.

### `src/hooks/address/useAddressForm.ts`
- `useReducer` for form state.
- `buildPayload` is the single source of truth for submission.

### `src/hooks/address/useLocationLogic.ts`
- Country → City → District cascade.
- Fetches only when the address modal is open.

### `src/components/modals/AddressModal.tsx`
- Form + map.
- Optimized: toasts are throttled, modal closes immediately on save.

### `src/components/modals/OrderTypeModal.tsx`
- Selects order type + delivery address.
- Skeletons and error states for better UX.

### `src/app/[locale]/(protected)/my-addresses/*`
- My addresses management page (list, add/edit/delete/default).
- Skeletons and error states for stability.

### `src/components/modals/AddressMap.tsx`
- Leaflet map with forward/reverse geocode.
- Cancels stale requests with AbortController.

### `src/lib/address/*`
- `deliverySync.ts`: decides which address should be active after mutations.
- `formatAddress.ts`: consistent display formatting.
- `constants.ts`: guest ID + default map coordinates.

---

## 4) Core Flows (Step‑by‑Step)

### A) Guest creates an address
1. User opens `AddressModal`.
2. Form state lives in `useAddressForm`.
3. On save, `useAddressFlow.saveAddress` stores to `useAddressStore`.
4. `useOrderStore` is updated to keep subheader in sync.

### B) Auth user creates/updates/deletes
1. `useAddressFlow.saveAddress` calls `useAddressMutations`.
2. Optimistic update inserts or updates cache.
3. On success, cache replaces temp with server data.
4. `deliverySync` ensures current delivery address is only changed when needed.

### C) Merge guest address after login
1. `useAuthFlowHandlers` calls `mergeGuestAddressAfterAuth`.
2. The merge checks existing addresses (cached or fetched).
3. If a match exists, it becomes active and guest storage is cleared.
4. If not, a create mutation is executed and then guest storage is cleared.

### D) Map click flow
1. `AddressMap` emits a click coordinate.
2. `reverseGeocode` resolves a human string.
3. Street is prefilled only if empty.
4. Toast appears only once per modal open (no spam).

---

## 5) State & Caching Matrix

| State | Tech | Storage | Notes |
| --- | --- | --- | --- |
| Guest Address | Zustand + Persist | LocalStorage | One address only |
| Active Delivery | Zustand + Persist | LocalStorage | Used by SubHeader |
| Cloud Addresses | React Query | Memory | Normalized, 5 min staleTime |
| Form State | useReducer | Component | Modal lifetime |

---

## 6) UX & Performance Decisions

- Modals are mounted only when open (lower JS cost).
- Skeletons prevent layout shift (OrderType + MyAddresses).
- Location requests only when modal is open.
- Optimistic UI keeps lists instant and consistent.
- All addresses are normalized at the cache and store layers.

---

## 7) Error Handling

- React Query rollbacks on mutation failure.
- Non‑blocking merges (`Promise.allSettled`).
- Error states in address lists include retry actions.

---

## 8) Adding New Fields Checklist

1. Update `Address` in `src/types/address.ts`.
2. Add to `useAddressForm` state + payload.
3. Update `normalizeAddress`.
4. Update `toCreateAddressRequest` and `toUpdateAddressRequest`.
5. Update UI inputs if needed.

---

## 9) Quick File Map (Paths)

- `src/types/address.ts`
- `src/services/store-service.ts`
- `src/hooks/useAddresses.ts`
- `src/hooks/address/useAddressFlow.ts`
- `src/hooks/useAddressMerge.ts`
- `src/hooks/address/useAddressForm.ts`
- `src/hooks/address/useLocationLogic.ts`
- `src/store/useAddressStore.ts`
- `src/store/useOrderStore.ts`
- `src/components/modals/AddressModal.tsx`
- `src/components/modals/OrderTypeModal.tsx`
- `src/components/modals/AddressMap.tsx`
- `src/app/[locale]/(protected)/my-addresses/MyAddressesView.tsx`
- `src/app/[locale]/(protected)/my-addresses/AddressCard.tsx`
- `src/lib/address/deliverySync.ts`
- `src/lib/address/formatAddress.ts`
- `src/lib/address/constants.ts`

---
