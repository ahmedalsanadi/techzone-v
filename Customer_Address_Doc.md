# Customer Address Integration Documentation

This document outlines the architecture, data flow, and implementation details of the customer address system in the `store-restaurants` project. It serves as a comprehensive reference for both humans and AI agents to understand how guest and authenticated addresses are managed, merged, and displayed.

## 1. Core Architecture

The system is designed to handle two distinct user states:

- **Guest (Unauthenticated):** Limited to **one** delivery address stored locally.
- **Customer (Authenticated):** Multiple addresses managed via the Libero API, with one marked as `is_default`.

### Key Data Entities

- **Address Object:** Standardized based on `src/types/address.ts`.
- **Selected Order Context:** Managed by `useOrderStore` to determine how the current order will be fulfilled.

---

## 2. State Management

### `useAddressStore.ts` (Local Storage)

- **Purpose:** Stores the guest's single address.
- **Persistence:** Uses Zustand `persist` middleware with `localStorage`.
- **Key Methods:**
    - `addAddress(address)`: Adds/Initializes the guest address.
    - `updateAddress(address)`: Replaces/Updates the guest address.
    - `clearAddresses()`: Wipes local storage (called after successful merge).

### `useOrderStore.ts` (Runtime Context)

- **Purpose:** Tracks the _active_ selection for the current session.
- **Fields:**
    - `orderType`: `'delivery'`, `'pickup'`, etc.
    - `deliveryAddress`: The specific `Address` object chosen for delivery.
- **Type Consistency:** The `DeliveryAddress` type is a direct alias of the `Address` type to ensure compatibility.

### `useAuthStore.ts`

- **Purpose:** Tracks `isAuthenticated` status, which gates whether to fetch from the API or Local Storage.

---

## 3. The Implementation Flow

### A. Lifecycle: Guest User

1. User opens `OrderTypeModal`.
2. Interactive map/form saves address to `useAddressStore` (Local Storage).
3. Value is mirrored to `useOrderStore.deliveryAddress` for immediate UI feedback.

### B. Lifecycle: Authentication & Merging

1. **Trigger:** User logs in or completes signup.
2. **Hook:** `useAddressMerge.ts` provides `mergeGuestAddressAfterAuth`.
3. **Logic:**
    - Checks if `isAuthenticated` is true and `useAddressStore.addresses` has data.
    - Iterates through local addresses and calls `storeService.createAddress(payload)` for each.
    - On success, calls `clearAddresses()` to empty Local Storage.
4. **Integration Points:** `src/hooks/auth/useAuthFlowHandlers.ts` calls this merge function during `handleOtpSubmit` and `handleSignupSubmit`.

### C. Lifecycle: Authenticated User

1. `OrderTypeModal` detects `isAuthenticated`.
2. Fetches full address list from `GET /store/addresses` via `storeService`.
3. If no address is currently selected in `useOrderStore`, it auto-selects the `is_default` address from the API response.
4. **Robustness:** Includes a retry mechanism (up to 2 times) to handle transient 500 errors often seen immediately after login.

---

## 4. Components & Display Logic

### UI Components

- **`OrderTypeModal.tsx`:** The "Brain" of the selection. Handles switching between order types and selecting from the list of saved addresses.
- **`AddressModal.tsx`:** The "Editor". Shared between Guest/Auth to create/edit addresses.
- **`MyAddressesView.tsx`:** The "Management Hub". Allows authenticated users to manage their address book.

### Display Consistency & Fallbacks

Because API responses can vary (e.g., `building` vs `building_number`, `notes` vs `description`), all display components use a unified fallback logic:

- **Title:** `label` || `name` || 'Address'
- **Details:** `formatted` || `${street}, ${building_number}, ${city}`
- **Extras:** `notes` || `description`

**Affected Files for Display:**

- `src/components/layouts/SubHeader.tsx` (Global header)
- `src/app/[locale]/(protected)/checkout/components/OrderTypeCard.tsx` (Checkout page)
- `src/app/[locale]/(protected)/my-addresses/AddressCard.tsx` (Management page)

---

## 5. API Reference Summary

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/store/addresses` | List all customer addresses. |
| POST | `/store/addresses` | Create a new address (used by Modal and Merge logic). |
| PUT | `/store/addresses/{id}` | Update existing address. |
| DELETE | `/store/addresses/{id}` | Remove address. |

---

## 6. Refactoring Cheat Sheet (For Future Use)

If refactoring in the future, keep these constraints in mind:

1. **Type Safety:** Always use the `Address` type from `@/types/address.ts`. Do not create local interfaces for addresses.
2. **Snake Case:** The Libero API expects snake_case for payloads (`recipient_name`, `country_id`, `is_default`).
3. **The "Single Guest Address" Rule:** While the store is an array, business logic currently enforces a single address for guests.
4. **Auth Race Conditions:** Ensure `mergeGuestAddressAfterAuth` completes _before_ the UI tries to fetch the list to avoid duplicate or missing data.
5. **Syncing Check:** Always verify if `is_default: true` is being handled correctly so that only one address has the flag.
