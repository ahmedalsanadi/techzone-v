# Customer Address Flow — Full Documentation

This document describes the **entire address flow** in the `store-restaurants` project: what each file does, what it stores, when and how data syncs (guest vs authenticated), which endpoints and caches are used, validations, and real implementation details. It is written so that any developer or AI agent can refactor, extend, or fix the address feature without missing behavior or corrupting state.

---

## Table of Contents

1. [High-Level Flow: Guest vs Authenticated](#1-high-level-flow-guest-vs-authenticated)
2. [Data Stores and What They Hold](#2-data-stores-and-what-they-hold)
3. [When and How Sync Happens](#3-when-and-how-sync-happens)
4. [API Endpoints, Caching, and Response Shapes](#4-api-endpoints-caching-and-response-shapes)
5. [File-by-File: What Each File Does](#5-file-by-file-what-each-file-does)
6. [End-to-End Flows (Step-by-Step)](#6-end-to-end-flows-step-by-step)
7. [Validations and Business Rules](#7-validations-and-business-rules)
8. [Types and Tech Stack](#8-types-and-tech-stack)
9. [Where to Find Things](#9-where-to-find-things)
10. [Bad Practices, Potential Enhancements, and Optimizations](#10-bad-practices-potential-enhancements-and-optimizations)

---

## 1. High-Level Flow: Guest vs Authenticated

### 1.1 Two User States

| State | Who | Where address data lives | How many addresses |
|-------|-----|---------------------------|--------------------|
| **Guest (not authenticated)** | User not logged in | Local only: `useAddressStore.guestAddress` + `useOrderStore.deliveryAddress` (both persisted in `localStorage`) | **Exactly one** guest address |
| **Authenticated** | User logged in | Backend API (Libero) + React Query cache; display copy in `useOrderStore.deliveryAddress` (persisted) | Multiple; one can be default |

### 1.2 Source of Truth by State

- **Guest:**  
  - **Single address:** `useAddressStore.guestAddress` (persisted as `guest-address-storage`).  
  - **What is shown in SubHeader / checkout:** `useOrderStore.deliveryAddress`. When a guest saves an address, both `guestAddress` and `deliveryAddress` are set so the UI shows it.

- **Authenticated:**  
  - **List and details:** React Query (`['addresses']`, `['address', id]`) via `storeService` (Libero API).  
  - **Display address (SubHeader, OrderTypeModal, checkout):** `useOrderStore.deliveryAddress`. It is updated when the user selects an address, when one is created/updated as default, or when the current one is deleted.

### 1.3 When Sync Happens (Summary)

- **Guest → Backend:** Never. Guest address stays local until the user logs in or signs up.
- **Login / Signup:** After successful auth, `useAddressMerge.mergeGuestAddressAfterAuth()` runs. If there is a `guestAddress`, it is sent to the API as a new address (with `is_default: true`), then `deliveryAddress` is set to that new address and `guestAddress` is cleared.
- **Authenticated:**  
  - **Read:** On mount when components use `useAddresses()` or `useAddress(id)` (with React Query caching).  
  - **Write:** Create/Update/Delete go through `useAddressMutations`; on success, React Query cache is invalidated and `deliveryAddress` is updated if the changed address is the one currently displayed (or if it becomes default).

Details are in [§3 When and How Sync Happens](#3-when-and-how-sync-happens).

---

## 2. Data Stores and What They Hold

### 2.1 `useAddressStore` — Guest address only

- **File:** `src/store/useAddressStore.ts`
- **Purpose:** Hold the **single** guest address for unauthenticated users.
- **What it stores:**
  - `guestAddress: Address | null`
  - Actions: `setGuestAddress(address | null)`, `clearGuestAddress()`.
- **Persistence:** Zustand `persist` with `createJSONStorage(() => localStorage)`, key: `guest-address-storage`, version: `2`.
- **Migration:** From version `< 2` (old array-based `addresses`), the first element is taken as `guestAddress`; otherwise state is used as-is.
- **Used by:** `OrderTypeModal` (read/write guest address), `useAddressMerge` (read + clear after merge).

### 2.2 `useOrderStore` — Delivery address for display

- **File:** `src/store/useOrderStore.ts`
- **Purpose:** Hold the **currently selected** delivery address shown in SubHeader, OrderTypeModal, and checkout. Also holds order type, scheduled time, and order time (now/later).
- **What it stores:**
  - `deliveryAddress: DeliveryAddress | null` (alias for `Address`)
  - `orderType`, `scheduledTime`, `orderTime`, plus setters and `clearOrder()`.
- **Persistence:** `order-storage` in `localStorage`; `scheduledTime` is serialized as ISO string and rehydrated; helper `getScheduledTimeAsDate()` is used in components to get a `Date`.
- **Used by:** SubHeader, OrderTypeModal, OrderTypeCard (checkout), useAddresses mutations (to update display after create/update/delete), useAddressMerge (to set display after merge).

### 2.3 React Query (addresses for authenticated users)

- **Hooks:** `src/hooks/useAddresses.ts`
- **What it stores (in memory / React Query cache):**
  - `['addresses']` — list of addresses (from `GET /store/addresses`)
  - `['address', id]` — single address (from `GET /store/addresses/:id`)
  - `['countries']`, `['cities', countryId]`, `['districts', cityId]` — location dropdowns
- **Persistence:** None. Cache is in memory; `staleTime`/`gcTime` control refetch and garbage collection (see [§4](#4-api-endpoints-caching-and-response-shapes)).

### 2.4 Auth state (for “when” to sync and protect APIs)

- **File:** `src/store/useAuthStore.ts`
- **Relevant:** `isAuthenticated` (derived from `token != null` after rehydration).  
- **Used by:** All address hooks and components to decide between guest path (single local address) and authenticated path (API + mutations).

---

## 3. When and How Sync Happens

### 3.1 Guest: No sync to backend

- Guest address is only in `useAddressStore` and `useOrderStore`.
- No timer-based or background sync; the only “sync” is copying to `deliveryAddress` when the user saves an address in OrderTypeModal (or when opening the modal and there is already a guest address — OrderTypeModal syncs `guestAddress` → `deliveryAddress` if `deliveryAddress` is null).

### 3.2 Login / Signup: Guest address merge

- **When:**  
  - **Existing user:** Right after OTP verification in `useAuthFlowHandlers.handleOtpSubmit`: after `setAuth(...)`, `Promise.all([mergeGuestCartAfterAuth, mergeGuestWishlistAfterAuth, mergeGuestAddressAfterAuth])` runs, then redirect.  
  - **New user:** After profile completion in `useAuthFlowHandlers.handleSignupSubmit`: after `storeService.updateProfile(...)` and `setProfile(...)`, the same `Promise.all([... mergeGuestAddressAfterAuth, ...])` runs, then redirect.
- **Where:** `src/hooks/auth/useAuthFlowHandlers.ts` (calls `mergeGuestAddressAfterAuth`) and `src/hooks/useAddressMerge.ts` (implements it).
- **How:**  
  1. `mergeGuestAddressAfterAuth()` runs only if `isAuthenticated && guestAddress` (from store).  
  2. Builds a payload from `guestAddress` (label, recipient_name, phone, country_id, city_id, district_id, street, lat/lng, building, unit, etc., `is_default: true`).  
  3. Calls `storeService.createAddress(payload)` → `POST /store/addresses`.  
  4. On success: `setDeliveryAddress(createdAddress)`, then `clearGuestAddress()`.  
  5. On failure: guest address is left in storage (no clear); error is only logged; no toast in the merge hook (caller can show toast if needed).

So: **sync from guest to cloud happens only at login (existing user) or after signup (new user), once per session**, and only when there is a guest address.

### 3.3 Authenticated: After mutations

- **Create:** `useAddressMutations.createAddress` — on success, invalidates `['addresses']` and, if the new address `is_default`, calls `setDeliveryAddress(newAddress)`.
- **Update:** `useAddressMutations.updateAddress` — on success, invalidates `['addresses']` and `['address', id]`, and **always** calls `setDeliveryAddress(updatedAddress)` (so the SubHeader/checkout always shows the latest version of the address you edited).
- **Delete:** `useAddressMutations.deleteAddress` — on success, invalidates `['addresses']`; if the deleted id is the current `deliveryAddress.id`, calls `setDeliveryAddress(null)`.

There is **no** periodic refetch or sync timer; refetch happens when React Query considers data stale (see staleTime in [§4](#4-api-endpoints-caching-and-response-shapes)) or when cache is invalidated after mutations.

---

## 4. API Endpoints, Caching, and Response Shapes

### 4.1 Base URL and auth

- **Client:** Requests go to `/proxy` (relative), which forwards to the Libero API (see `src/services/api.ts`: `getBaseUrl()`).
- **Protected routes:** `isProtected: true` is passed to `fetchLibero`/`fetchLiberoFull`. Then `getBaseHeaders(..., isProtected)` in `src/services/utils.ts` adds `Authorization: Bearer <token>` using the `accessToken` cookie (see `AUTH_COOKIES.ACCESS_TOKEN` in `src/lib/auth/constants.ts`).

### 4.2 Address endpoints (all under `/store/addresses`, protected)

| Method | Endpoint | Used for | Request body / params | Response (typical) |
|--------|----------|-----------|----------------------|--------------------|
| GET | `/store/addresses` | List user addresses | Optional query: `default`, `label` | `ApiResponse<Address[]>` → `data: Address[]` |
| GET | `/store/addresses/:id` | Single address (e.g. edit form) | — | `ApiResponse<Address>` → `data: Address` |
| POST | `/store/addresses` | Create address (including merge) | JSON body: snake_case (see CreateAddressRequest) | `ApiResponse<Address>` → `data: Address` |
| PUT | `/store/addresses/:id` | Update address | JSON body: partial snake_case | `ApiResponse<Address>` → `data: Address` |
| DELETE | `/store/addresses/:id` | Delete address | — | Full response; `data` may be null |

API response wrapper: `{ success: boolean, message?: string, data: T }`. The service layer returns `data` for `fetchLibero` and the full object for `fetchLiberoFull`.

### 4.3 Location endpoints (countries, cities, districts)

Used by AddressModal for dropdowns. **Not** protected by customer auth in the current code (called without `isProtected: true` in store-service; if your backend requires auth, that may need to be added).

| Method | Endpoint | Params | Caching (server) |
|--------|----------|--------|-------------------|
| GET | `/store/locations/countries` | — | `revalidate: 86400` (24h) |
| GET | `/store/locations/cities` | `country_id` | `revalidate: 86400` |
| GET | `/store/locations/districts` | `city_id` | `revalidate: 86400` |

### 4.4 React Query caching (client)

| Query key | staleTime | gcTime (default) | enabled |
|-----------|-----------|-------------------|---------|
| `['addresses']` | 5 min | 5 min (default) | `isAuthenticated` |
| `['address', id]` | 10 min | 10 min (default) | `isAuthenticated && id != null` |
| `['countries']` | 24 h | default | always |
| `['cities', countryId]` | 24 h | default | `countryId != null` |
| `['districts', cityId]` | 24 h | default | `cityId != null` |

After create/update/delete, `queryClient.invalidateQueries({ queryKey: ['addresses'] })` (and for update, also `['address', id]`) is called so the next read gets fresh data.

### 4.5 Geocoding (map search) — not Libero

- **AddressMap** uses a **proxy** for Nominatim: `/proxy/nominatim/reverse` and `/proxy/nominatim/search`.
- **Reverse:** `GET /proxy/nominatim/reverse?format=json&lat=...&lon=...&accept-language=ar` → returns `display_name`.
- **Search:** `GET /proxy/nominatim/search?format=json&q=...&limit=1&accept-language=ar` → returns first result `{ lat, lon, display_name }`.
- No caching is implemented in the doc’s scope; debounce is 800 ms for search.

---

## 5. File-by-File: What Each File Does

### 5.1 Page and view (my-addresses)

- **`src/app/[locale]/(protected)/my-addresses/page.tsx`**  
  - Server component; generates metadata (title, description) from `MyAddresses` translations.  
  - Renders `<MyAddressesView />`.  
  - Route is under `(protected)` so middleware/layout can enforce auth; unauthenticated users may be redirected (depends on your auth middleware).

- **`src/app/[locale]/(protected)/my-addresses/MyAddressesView.tsx`**  
  - Client component.  
  - Uses `useAddresses()` for list and `useAddressMutations()` for create/update/delete.  
  - State: `isModalOpen`, `editingAddress` (Address | null).  
  - Handlers: Add (open modal with null), Edit (set editingAddress + open modal), Delete (confirm + `deleteAddress.mutateAsync(id)`), Set default (`updateAddress.mutateAsync({ id, data: { is_default: true } })`), Save (if editingAddress then update else create; then close modal).  
  - Renders: Breadcrumbs, header with “Add new” button, loading vs list of AddressCards vs empty state, and `<AddressModal>` with `initialAddress={editingAddress}` and `onSave={handleSave}`.  
  - **Only used when authenticated** (page is under protected route); no guest path here.

### 5.2 Address card

- **`src/app/[locale]/(protected)/my-addresses/AddressCard.tsx`**  
  - Presentational card for one `Address`.  
  - Props: `address`, `onEdit`, `onDelete`, `onSetDefault`.  
  - Displays: label, default badge, formatted line (formatted or street + building + unit + city), phone, recipient_name, notes/description.  
  - Click on card (when not default) calls `onSetDefault(address.id)`. Edit/Delete buttons call `onEdit(address)` / `onDelete(address.id)` with `stopPropagation` so card click doesn’t fire.

### 5.3 Modals

- **`src/components/modals/AddressModal.tsx`**  
  - Central form for add/edit address (guest and auth).  
  - Props: `isOpen`, `onClose`, `onSave(addressData)`, `initialAddress?`.  
  - **Auth vs guest:** If authenticated and `initialAddress?.id` exists, it uses `useAddress(initialAddress.id)` to fetch full address (so map coords and nested location are correct); otherwise uses `initialAddress` from props.  
  - Form state: `useReducer` for form fields (addressName, recipientName, phone, notes, street, building, unit, postalCode, additionalNumber, isDefault) and for location (selectedCountry, selectedCity, selectedDistrict). Map state: searchQuery, selectedLocation [lat, lng], formattedAddress.  
  - Location data: `useCountries()`, `useCities(selectedCountry)`, `useDistricts(selectedCity)`.  
  - Validation: `isValid` requires addressName, phone, selectedCountry, selectedCity, street, and selectedLocation (and not 0,0).  
  - On Save: builds one object (camelCase + snake_case for API: label, recipient_name, phone, country_id, city_id, district_id, street, building, unit, postal_code, additional_number, description, is_default, latitude, longitude, plus name, formatted, building_number, unit_number, notes for UI compatibility). Calls `onSave(addressData)` then `onClose()`. It does **not** call mutations itself; the parent (MyAddressesView or OrderTypeModal) does.  
  - “Set as default” checkbox is shown only when `isAuthenticated`.  
  - AddressMap is lazy-loaded; map center from `DEFAULT_MAP_CENTER` in `@/lib/branches` (or from `lib/branches/constants.ts`: `[24.7136, 46.6753]`).

- **`src/components/modals/OrderTypeModal.tsx`**  
  - Modal for order type (delivery, dineIn, pickup, carPickup), delivery address selection, and order time (now/later) + optional date/time picker.  
  - Reads: `useOrderStore` (orderType, deliveryAddress, scheduledTime, orderTime, setters), `useAddressStore` (guestAddress, setGuestAddress), `useAuthStore` (isAuthenticated), `useAddresses()` and `useAddressMutations()`.  
  - **Sync on open:** If authenticated and addresses exist and no deliveryAddress, sets deliveryAddress to default or first; if guest and guestAddress exists and no deliveryAddress, sets deliveryAddress to guestAddress.  
  - **Address list:** Authenticated → `authAddresses`; guest → `[guestAddress]` if present else `[]`.  
  - **Can add new:** `canAddAddress = isAuthenticated || (!isAuthenticated && !guestAddress)`. So for guest, “Add new” is hidden once they already have one address.  
  - Add/Edit: opens AddressModal with `editingAddress` (null or Address). On save (`handleAddressSave`): if auth, create/update via mutations and optionally set deliveryAddress; if guest, setGuestAddress + setDeliveryAddress with a synthetic id (e.g. `Date.now()`), then close modal.  
  - Renders list of addresses (or empty state “Add address” button); order type and time sections; footer “Save” closes modal.

- **`src/components/modals/AddressMap.tsx`**  
  - Leaflet map: center, zoom from `@/lib/branches` (DEFAULT_MAP_ZOOM).  
  - Props: `center`, `onLocationSelect(location, formatted)`, `searchQuery`.  
  - Click on map: reverse geocode via proxy Nominatim, then `onLocationSelect([lat, lng], display_name)`.  
  - When `searchQuery` changes (debounced 800 ms), forward geocode and call `onLocationSelect` with result.  
  - SSR guard: on server renders a loading placeholder.  
  - Used only inside AddressModal (lazy-loaded).

### 5.4 Layouts and checkout

- **`src/components/layouts/SubHeader.tsx`**  
  - Shows branch name, order type (dineIn, pickup, delivery), and when order type is delivery and `deliveryAddress` is set: “Delivery to (label) + formatted address” and optional scheduled time; “Edit” opens OrderTypeModal.  
  - Subscribes to `useOrderStore.deliveryAddress` (and orderTime, scheduledTime). No direct address API calls.

- **`src/components/layouts/Navbar.tsx`**  
  - No address logic; nav, search, user menu, cart. Included in your list but not part of address flow.

- **`src/app/[locale]/(protected)/checkout/components/OrderTypeCard.tsx`**  
  - Checkout summary card: order type, delivery address (from `useOrderStore.deliveryAddress`) or branch, and time (now/later + scheduled).  
  - “Edit” opens OrderTypeModal. Read-only for address; no mutations.

### 5.5 Hooks

- **`src/hooks/useAddresses.ts`**  
  - `useAddresses()`: query `['addresses']`, `storeService.getAddresses()`, enabled when `isAuthenticated`, staleTime 5 min.  
  - `useAddress(id)`: query `['address', id]`, `storeService.getAddress(id)`, enabled when authenticated and id not null, staleTime 10 min.  
  - `useAddressMutations()`: createMutation, updateMutation, deleteMutation; on success each invalidates and updates `useOrderStore.deliveryAddress` as described in §3.3.  
  - `useCountries()`, `useCities(countryId)`, `useDistricts(cityId)`: location dropdowns, long staleTime.

- **`src/hooks/useAddressMerge.ts`**  
  - `mergeGuestAddressAfterAuth()`: if authenticated and guestAddress, builds payload from guestAddress, calls `storeService.createAddress`, then setDeliveryAddress(created) and clearGuestAddress(). Used only from useAuthFlowHandlers after login/signup.

- **`src/hooks/auth/useAuthFlowHandlers.ts`**  
  - After OTP success (existing user): setAuth, then `Promise.all([mergeGuestCartAfterAuth, mergeGuestWishlistAfterAuth, mergeGuestAddressAfterAuth])`, then redirect.  
  - After signup submit (new user): updateProfile, setProfile, then same Promise.all including mergeGuestAddressAfterAuth, then redirect.

### 5.6 Stores (already summarized in §2)

- **`src/store/useAddressStore.ts`** — guest single address, persisted.  
- **`src/store/useOrderStore.ts`** — deliveryAddress + order type/time, persisted.  
- **`src/store/useAuthStore.ts`** — user, token, isAuthenticated (and profile).

### 5.7 Services and types

- **`src/services/store-service.ts`**  
  - Address: getAddresses(params?), getAddress(id), createAddress(data), updateAddress(id, data), deleteAddress(id).  
  - Locations: getCountries(), getCities(countryId), getDistricts(cityId).  
  - All address methods use `isProtected: true` and pass through to `fetchLibero`/`fetchLiberoFull`.

- **`src/types/address.ts`**  
  - Country, City, District (id, name).  
  - Address: id, label, recipient_name, phone, country_id, city_id, district_id, street, building/building_number, unit/unit_number, postal_code, additional_number, description/notes, is_default, latitude, longitude, plus UI helpers (country_name, city_name, district_name, formatted, name, isDefault).  
  - CreateAddressRequest: required label, phone, country_id, city_id, street, latitude, longitude; optional recipient_name, district_id, building, unit, postal_code, additional_number, description, is_default.  
  - UpdateAddressRequest = Partial<CreateAddressRequest>.

### 5.8 Auth constants

- **`src/lib/auth/constants.ts`**  
  - PROTECTED_ROUTES includes `/my-addresses`.  
  - PROTECTED_API_ENDPOINTS includes `/store/addresses` (and cart, profile, etc.).  
  - AUTH_STORAGE_KEYS, AUTH_COOKIES, COOKIE_MAX_AGE — used by auth and API headers.

---

## 6. End-to-End Flows (Step-by-Step)

### 6.1 Guest adds first (and only) address

1. User is not logged in; `useAddressStore.guestAddress` and `useOrderStore.deliveryAddress` are null.  
2. User opens SubHeader → “Edit” or chooses delivery → OrderTypeModal opens.  
3. Empty list; user clicks “Add address” → AddressModal opens with no initialAddress.  
4. User fills form + map, saves. OrderTypeModal `handleAddressSave`: `setGuestAddress(newAddress)` (with synthetic id), `setDeliveryAddress(newAddress)`, close modal.  
5. SubHeader now shows that address (from deliveryAddress).  
6. No API call; data only in localStorage (guest-address-storage + order-storage).

### 6.2 Guest with address logs in (merge)

1. Guest has one address in guestAddress + deliveryAddress.  
2. User completes OTP (existing user) or signup form (new user).  
3. useAuthFlowHandlers runs merge: `mergeGuestAddressAfterAuth()`.  
4. useAddressMerge: POST /store/addresses with guest data, `is_default: true`.  
5. On success: setDeliveryAddress(createdAddress), clearGuestAddress().  
6. Redirect; next time addresses come from API and React Query; SubHeader still shows the same address (now from backend).

### 6.3 Authenticated user: list, add, edit, delete, set default

1. My Addresses page: useAddresses() fetches GET /store/addresses; list rendered with AddressCards.  
2. Add: open modal, save → parent calls createAddress.mutateAsync → POST /store/addresses → invalidate ['addresses'], if is_default set deliveryAddress.  
3. Edit: click Edit → modal opens with initialAddress; AddressModal uses useAddress(id) to load full address, user edits, save → updateAddress.mutateAsync → PUT /store/addresses/:id → invalidate ['addresses'] and ['address', id], setDeliveryAddress(updated).  
4. Delete: confirm → deleteAddress.mutateAsync(id) → DELETE → invalidate; if deleted was deliveryAddress, setDeliveryAddress(null).  
5. Set default: updateAddress.mutateAsync({ id, data: { is_default: true } }); mutations’ onSuccess always set deliveryAddress to the updated address, so SubHeader updates.

### 6.4 OrderTypeModal: auth vs guest

- **Auth:** Address list from useAddresses(); can add multiple; save goes through mutations; deliveryAddress synced from store.  
- **Guest:** List is [guestAddress] or []; can add only if !guestAddress; save updates guestAddress + deliveryAddress locally.

---

## 7. Validations and Business Rules

- **Guest:** At most one address; enforced by hiding “Add new” when guestAddress exists (OrderTypeModal).  
- **AddressModal:** Required: addressName, phone, country, city, street, map position (and selectedLocation not 0,0). Optional: recipient, district, building, unit, postal code, additional number, notes; is_default only for auth.  
- **API:** Backend may enforce its own (e.g. phone format, required fields). Frontend does not validate phone format or coordinate bounds beyond “has value”.  
- **Coordinates:** Sent as Number(lat), Number(lng); fallback in useAddressMerge for missing coords (e.g. 24.7136, 46.6753).  
- **Naming:** API uses snake_case (recipient_name, country_id, is_default, etc.); UI and types support both; AddressModal builds payload in snake_case for API.

---

## 8. Types and Tech Stack

- **Types:** `src/types/address.ts` (Address, CreateAddressRequest, UpdateAddressRequest, Country, City, District).  
- **State:** Zustand with persist (localStorage) for guest and order store; React Query for server state (auth).  
- **UI:** React, next-intl (translations: MyAddresses, Address, Order, SubHeader, Checkout), Tailwind, Lucide icons.  
- **Map:** Leaflet via react-leaflet; AddressMap lazy-loaded; Nominatim via app proxy.  
- **Forms:** useReducer in AddressModal for form and location; no separate form lib.

---

## 9. Where to Find Things

| Need | Location |
|------|----------|
| Guest address persistence | useAddressStore; key `guest-address-storage` |
| Display address (SubHeader, checkout) | useOrderStore.deliveryAddress; key `order-storage` |
| Address list (auth) | useAddresses() → React Query ['addresses'] |
| Single address (edit) | useAddress(id) → React Query ['address', id] |
| Create/Update/Delete + sync to display | useAddressMutations in useAddresses.ts |
| Merge guest → cloud | useAddressMerge.mergeGuestAddressAfterAuth; called from useAuthFlowHandlers |
| When merge runs | After OTP success (existing user) or after signup submit (new user) |
| Protected route list | lib/auth/constants.ts PROTECTED_ROUTES (includes /my-addresses) |
| Protected API list | lib/auth/constants.ts PROTECTED_API_ENDPOINTS (includes /store/addresses) |
| Address API calls | store-service.ts (getAddresses, getAddress, createAddress, updateAddress, deleteAddress) |
| Map center/zoom | lib/branches/constants.ts (DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM) |
| Geocoding | AddressMap.tsx; proxy /proxy/nominatim/... |

---

## 10. Bad Practices, Potential Enhancements, and Optimizations

### 10.1 Bad or risky practices

- **updateAddress onSuccess always sets deliveryAddress:** In `useAddressMutations`, every update calls `setDeliveryAddress(updatedAddress)`. So editing any address (even a non-default one) overwrites the current delivery address with that edited one. If the user had selected a different address for delivery and then edits another, the “selected” delivery address changes without explicit user action. Safer: only set deliveryAddress when the updated address is the current deliveryAddress or when it becomes default.
- **Guest id:** Guest address is given `id: Date.now()` in OrderTypeModal. If the user edits and saves again, a new id is assigned; any code that compares by id could treat it as a different address.
- **useAddressMerge payload:** Uses `country_id: guestAddress.country_id || 1` and lat/lng fallbacks; no validation that country_id/city_id/district_id are valid for the backend.
- **No retry or user feedback on merge failure:** If merge fails, guest address stays; only console.error. User is not told to try again or that the address was not synced.
- **AddressModal onSave:** Calls `onSave(addressData)` and then `onClose()` immediately; the parent performs async mutation. If the parent does not await before closing, modal can close before save completes; currently parents (MyAddressesView, OrderTypeModal) do await in handleSave/handleAddressSave, but the modal’s own handleSave is not async and doesn’t wait for the parent — so the modal closes optimistically. If the mutation fails, the user already sees the modal closed.
- **Duplicate formatting logic:** Address line formatting (street + building + unit + city) is repeated in AddressCard, SubHeader, OrderTypeCard. Should be one helper (e.g. `formatAddressLine(address)`).
- **Hardcoded “Syncing with Cloud...” / “Fetching accurate location details...”:** Not using translation keys in some places (e.g. MyAddressesView, AddressModal).

### 10.2 Potential enhancements

- **Merge feedback:** On login/signup, if merge runs, show a toast: “Your saved address has been added to your account” or, on failure, “We couldn’t add your address; you can add it again from My Addresses.”
- **Optimistic updates:** For set default or delete, consider optimistic UI and rollback on error.
- **Phone validation:** Validate phone format (e.g. Saudi) before submit.
- **Coordinates validation:** Reject or warn if lat/lng are outside expected bounds (e.g. country).
- **Single source for “can add address”:** Centralize `canAddAddress` (guest: !guestAddress; auth: true) in a small hook or constant so OrderTypeModal and any future entry points stay in sync.
- **Refetch on focus:** For addresses list, consider `refetchOnWindowFocus: true` (or only when returning to My Addresses tab) so long-lived tabs see updates.

### 10.3 Things to refactor or optimize

- **Update mutation and deliveryAddress:** Only call `setDeliveryAddress(updatedAddress)` when `updatedAddress.id === currentDeliveryAddress?.id` or when `updatedAddress.is_default` is true (and optionally set deliveryAddress to the new default from the list).
- **Extract address form payload builder:** The object built in AddressModal handleSave (camelCase → snake_case, with all aliases) could be a shared `toCreateAddressRequest(formState, locationState, selectedLocation, formattedAddress)` so OrderTypeModal guest path and mutation path use the same shape and validation.
- **Shared formatAddressLine:** One function in `src/lib/address-utils.ts` or similar, used by AddressCard, SubHeader, OrderTypeCard.
- **Type onSave:** Replace `onSave(address: any)` with `onSave(address: CreateAddressRequest | AddressPayload)` and define a single payload type used by both guest and API.
- **OrderTypeModal “Add new” visibility:** Currently “Add new” is shown when `canAddAddress && displayAddresses.length > 0`. So when guest has one address, the inline “Add new” is hidden (correct); when auth has addresses, “Add new” is shown. Empty state is a separate button. Consider making the rule explicit in a comment or variable (e.g. `showAddNewButton = canAddAddress && (displayAddresses.length > 0 || !isAuthenticated)` if you want guest empty state to show the same button style).
- **AddressModal:** Consider not calling onClose() inside handleSave; let the parent close after successful mutation so that on failure the modal stays open and the parent can show toast.
- **Dependencies in useAddressMerge:** `mergeGuestAddressAfterAuth` depends on `guestAddress` from store; if merge runs before Zustand rehydration, guestAddress might be null. Ensure auth flow runs after stores are rehydrated (e.g. after first paint or a rehydration guard).
- **StaleTime consistency:** useAddresses 5 min vs useAddress 10 min is intentional (list vs single). Document it in the hook so future changes don’t accidentally make single address fresher than list and cause confusion.

---

## Work log (reference)

- **Jan 30, 2026:** Guest limited to one address; React Query for addresses; AddressModal fetches by id when editing (auth); mutations sync to useOrderStore; OrderTypeModal hides “Add new” for guest with address; i18n and this doc updated.

---

*This document reflects the implementation as of the last review. When changing the address flow, update this doc and the “Work log” section so that future readers and AI agents have an accurate picture.*
