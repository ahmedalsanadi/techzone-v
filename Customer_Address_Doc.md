# Customer Address Integration Documentation (Refactored)

This document outlines the refactored architecture, data flow, and implementation details of the customer address system in the `store-restaurants` project.

## 1. Core Architecture

The system manages addresses based on two user states:

- **Guest (Unauthenticated):** Restricted to **exactly one** delivery address stored locally.
- **Customer (Authenticated):** Managed via the Libero API using React Query for performance and caching.

### Key Data Stores

- **`useAddressStore.ts` (Local):** Manages the single `guestAddress` for unauthenticated users. It uses `zustand/middleware` for persistence in `localStorage`.
- **`useOrderStore.ts` (Persisted):** Manages the `deliveryAddress` used for display purposes (e.g., SubHeader). This is the "active" address during the session.
- **React Query (`useAddresses`, `useAddress`, `useAddressMutations`):** The source of truth for authenticated users, providing standardized state for loading, error, and data fetching.

---

## 2. The Implementation Flow

### A. Lifecycle: Guest User

1. **Restriction:** If a `guestAddress` exists, the "Add New" button is hidden in the `OrderTypeModal` and `OrderTypeCard`.
2. **Persistence:** The guest address is saved to `localStorage` under the key `guest-address-storage`.
3. **Display:** The address is mirrored to `useOrderStore.deliveryAddress` automatically to ensure the SubHeader displays the correct location.

### B. Lifecycle: Authentication & Merging

1. **Trigger:** User logs in/signs up (handled in `useAuthFlowHandlers.ts`).
2. **Logic (`useAddressMerge.ts`):** 
    - Checks if a `guestAddress` exists in local storage.
    - Only then calls the API to create/merge this address into the account.
    - Sets the newly created cloud address as the "default" for the user.
    - If successful, it clears the guest address from local storage and syncs the new cloud address to `useOrderStore`.

### C. Lifecycle: Authenticated User

1. **Listing:** Addresses are fetched via the `useAddresses` hook. Caching is set to 5 minutes to reduce unnecessary API calls.
2. **Editing:** To ensure data accuracy (especially for coordinates and building details), `AddressModal` triggers a specific `useAddress(id)` hook when editing a cloud address. This prevents using potentially stale or incomplete data from the list view.
3. **Synchronization:** 
    - After any mutation (Create, Update, Delete), the system automatically updates `useOrderStore.deliveryAddress` if the changed address was the active one.
    - If the "Active Display Address" is deleted, it is cleared from the SubHeader and the user is prompted to select a new one.

---

## 3. Technology Stack & Optimization

- **React Query:** Used for all cloud operations.
    - `staleTime` and `gcTime` are tuned for geographical data.
    - `useAddressMutations` centralizes the logic for Create, Update, and Delete actions.
- **useReducer:** Used within `AddressModal` to manage complex form and location states (Country -> City -> District) reliably.
- **Lazy Loading:** `AddressMap` is dynamically imported to reduce initial bundle size and ensure Leaflet only runs in the browser.

---

## 4. Components Logic

- **`OrderTypeModal.tsx`:** Manages the selection of delivery vs pickup. For delivery, it lists user addresses from the cloud (Auth) or the local guest address. It enforces the "one guest address" rule by hiding the "Add New" button for guests.
- **`AddressModal.tsx`:** The central UI for address management. It handles both creation and editing, map interactions, and search. It uses `useCountries`, `useCities`, and `useDistricts` hooks to provide a dependent select list.
- **`SubHeader.tsx`:** Subscribes to `useOrderStore.deliveryAddress` to show the current location to the user globally.

---

## 5. Cheat Sheet for Future Changes

1. **Guest Limit:** Always check `guestAddress !== null` before rendering the "Add New" action for unauthenticated users.
2. **Data Consistency:** When updating an address that might be the active one, always call `setDeliveryAddress` in `useOrderStore`.
3. **API Casing:** Be mindful that the API uses snake_case (e.g., `recipient_name`, `country_id`), while the UI might use camelCase. The `AddressModal` handles this mapping.
4. **Geolocation:** The map center is managed as `[latitude, longitude]`. Always ensure these are cast to `Number` before sending to the API.

---

## Work Log (January 30, 2026)

### Today's Achievements:
1.  **Enforced Guest Address Limit**: Refactored `useAddressStore` to handle a single `guestAddress` instead of an array, strictly adhering to the business requirement.
2.  **React Query Migration**: Traditional state-based data fetching for addresses was replaced with `@tanstack/react-query`. Created `useAddresses`, `useAddress`, and `useAddressMutations` hooks for centralized management.
3.  **Accuracy Optimization**: Modified `AddressModal` to fetch full address details via API ID when editing for authenticated users, ensuring map coordinates and nested location data are precise.
4.  **State Synchronization**: Linked the React Query mutations to the local `useOrderStore`. Now, creating, updating, or deleting an address immediately updates the global SubHeader and order state.
5.  **UI Refinement**: Updated `OrderTypeModal` to hide the "Add New" button for guests who already have an address, guiding them to modify their existing one.
6.  **I18n Cleanup**: Added missing translations for "loading", "selectDateTime", and other address-related labels in both `ar.json` and `en.json`.
7.  **Documentation Update**: Revitalized this document to reflect the new architecture and provide a clear implementation flow for future maintenance.
