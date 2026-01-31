# 🏗️ Customer Address Architecture & Flow Documentation

**Version:** 3.0 (Master Edition) | **Status:** Production Ready | **Date:** January 30, 2026

This document provides an exhaustive, technical breakdown of the address management system. It is designed for developers who need to understand every moving part, from raw API responses to optimistic UI rendering.

---

## 1. Architectural Philosophy

The system follows a **Facade Pattern** via `useAddressFlow`. It acts as a single gatekeeper that decides whether to talk to the Backend API (Authenticated) or LocalStorage (Guest).

- **Optimism**: We assume the server succeeds and update the UI in <16ms.
- **Normalization**: We never trust external data shapes. Everything is sanitized before hitting the UI.
- **Independence**: Components like `AddressCard` don't know if they are displaying a guest address or a cloud address; they just receive a standardized `Address` object.

---

## 2. Directory & File Breakdown

### 📂 `src/types/` — Data Contracts

#### `address.ts`

- **Purpose**: Defines the structure of addresses and provides transformation utilities.
- **Key Exports**:
    - `interface Address`: The standardized internal model.
    - `interface AddressFormSubmitPayload`: The intermediate shape used by the form before being sent to the API.
    - `normalizeAddress(addr)`: **Critical Function.** It maps legacy and backend-flattened fields (like `country`, `city`, `district`, `notes`, `building_number`) to standardized fields. It ensures that even if the API returns IDs or names in different formats, the UI always sees a consistent `Address` object with populated `country_name`, `city_name`, and `district_name`. Used everywhere data enters the system.
    - `toCreateAddressRequest(payload)`: Converts the UI payload into the exact snake_case structure the Libero API expects.

### 📂 `src/hooks/` — Business Logic

#### `address/useAddressFlow.ts`

- **Purpose**: The primary interface for all UI components.
- **Functions**:
    - `saveAddress(payload, id?)`: Determines if the request is an Update or Create, and whether it's for a Guest or Auth user.
    - `setDefault(id)`: Highly optimized call that handles the "Switching Default" logic.
- **Why?**: To keep components like `OrderTypeModal` and `MyAddressesView` clean and DRY.

#### `useAddresses.ts`

- **Purpose**: The data access layer powered by React Query.
- **Functions**:
    - `useAddressMutations()`: Contains `createAddress`, `updateAddress`, `deleteAddress`, and `setDefaultAddress`.
    - `onMutate`: Implements **Optimistic Updates**. It multi-tasks: cancels outgoing requests, snapshots the current cache, and injects the new data with a temporary negative ID.
    - `onError`: Reverts the cache to the snapshot if the API fails.
    - `onSuccess`: Replaces the temporary data with real server data (IDs, etc.).

#### `address/useAddressForm.ts`

- **Purpose**: A specialized `useReducer` hook for the 10+ address fields.
- **Functions**:
    - `reset(initial?)`: Synchronously clears or hydrates the form.
    - `buildPayload(...)`: Aggregates form state + map state + location state into a single `AddressFormSubmitPayload`.

#### `address/useLocationLogic.ts`

- **Purpose**: Manages the cascading state of Country -> City -> District.
- **Functions**:
    - `dispatch({ type: 'SET_COUNTRY', value })`: Automatically clears the selected City and District to prevent invalid combinations.

#### `useAddressMerge.ts`

- **Purpose**: Syncs guest data to the account after authentication.
- **Functions**:
    - `mergeGuestAddressAfterAuth()`: Runs once after a successful login. It takes the `guestAddress` from LocalStorage and sends it to the server as the new default account address.

### 📂 `src/lib/address/` — Utilities

#### `geocoding.ts`

- **Purpose**: Communicates with the Nominatim proxy.
- **Functions**:
    - `reverseGeocode(lat, lng)`: Converts map clicks into human-readable strings. Used as a "Suggestion" for the street field.
    - `forwardGeocode(query)`: Converts search text into map coordinates.

#### `deliverySync.ts`

- **Purpose**: Decides which address is currently "Active" for the shop subheader.
- **Functions**:
    - `getNextDeliveryAddressAfterMutation(...)`: Complex logic that ensures we don't switch the user's active address unless they specifically edited the active one or set a new one as default.

#### `formatAddress.ts`

- **Purpose**: UI string builders.
- **Functions**:
    - `formatAddressForDisplay(address)`: Safely concatenates street, building, and unit into a pretty string.

---

## 3. Data Flow: The Journey of a Map Click

1.  **Selection**: User clicks the map in `AddressMap.tsx`.
2.  **Lookup**: `reverseGeocode` is called. It sends a fetch to `/proxy/nominatim/reverse`.
3.  **Hydration**: The result is sent to `onLocationSelect` in `AddressModal.tsx`.
4.  **Form Sync**: If the "Street" field is empty, it's automatically filled with the geocoded address.
5.  **Submission**: User clicks "Save". `handleSave` triggers `onClose` (Modal disappears - **Perception of speed**).
6.  **Mutation**: `saveAddress` is called. It passes the payload to `useAddressMutations`.
7.  **Optimism**: `onMutate` runs. The `AddressCard` in the list appears instantly with a "Syncing..." pulse.
8.  **API**: A `POST /store/addresses` is sent.
9.  **Resolution**: `onSuccess` runs. The pulse stops. The address is now permanent.

---

## 4. State Management Matrix

| State Type | Technology | Storage | Lifespan |
| :-- | :-- | :-- | :-- |
| **Guest Address** | Zustand + Persist | LocalStorage | Eternal (until login/clear) |
| **Active Delivery** | Zustand + Persist | LocalStorage | Eternal |
| **Cloud Addresses** | React Query | In-Memory | 5 minutes (staleTime) |
| **Form State** | useReducer | Component | Until modal closes |

---

## 5. Security & Error Handling

- **Automatic Rollbacks**: If an optimistic update fails, the UI "snaps back" to the previous list automatically.
- **Abort Signals**: Maps and geocoders use `AbortController`. If a user moves the map 10 times quickly, 9 requests are cancelled, saving bandwidth.
- **Sanitization**: `toCreateAddressRequest` ensures that no "garbage" UI state (like temporary IDs or display names) is sent to the backend.

## 6. UI Component Hierarchy

- **`OrderTypeModal` (Entry Point)**: Handles selection between Delivery/Pickup.
    - **`AddressCard` (Small)**: Displays the single selected address.
    - **`AddressModal` (Form)**: The high-level overlay for input.
        - **`AddressMap` (Interactive)**: Leaflet integration for coordinate picking.
- **`MyAddressesView` (Management)**: The dedicated dashboard page.
    - **`AddressCard` (Large)**: Management version with Edit/Delete/Default actions.

---

## 7. Translation & i18n Mapping

The system is fully localized (Arabic/English). Key namespaces:

- `MyAddresses`: Page titles, empty states, and management button labels.
- `Address`: Form labels (Street, Building, Notes) and validation error messages.
- `Order`: General order flow text used in `OrderTypeModal`.

---

## 8. Development FAQ

**Q: How do I add a new field to the address?**

1. Update the `Address` interface in `src/types/address.ts`.
2. Add the field to the `initialState` in `useAddressForm.ts`.
3. Update `normalizeAddress` to handle the field correctly.
4. Update `buildPayload` in `useAddressForm.ts` to include it in the submission.

**Q: Where is the default map location defined?** In `src/lib/address/constants.ts` (currently pointing to Riyadh, Saudi Arabia).

---
