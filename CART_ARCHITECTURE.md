# Cart System Architecture & Flow Documentation

This document provides a detailed technical overview of the Cart system implemented in the Fasto Ecommerce / Store Restaurants project.

## 1. System Overview

The cart system is a hybrid solution designed to provide a seamless user experience across two distinct states:

- **Guest Mode**: Items are stored locally in `localStorage` using Zustand persistence.
- **Authenticated Mode**: Items are synchronized with the backend API, ensuring data consistency across devices.

## 2. Core Components

### A. State Management (`useCartStore.ts`)

The central hub for cart data. It manages:

- `items`: An array of `CartItem` objects.
- `isGuestMode`: A boolean flag determining where data should be read from/written to.
- `isLoading`: Manages pending API states.
- `lastSyncedAt`: Timestamp to prevent redundant API calls (sync guard).

### B. Stable ID Generation (`lib/cart/utils.ts`)

A critical part of the system is the `generateCartItemId` function. It creates a deterministic, unique string for every unique product configuration.

- **Components of the ID**: `productId` + `variantId` + `sortedAddonIds` + `customFields`.
- **Purpose**: Ensures that adding the exact same item twice (same addons, same size) increases the quantity instead of creating a duplicate entry in the cart.

### C. Unified Actions (`useCartActions.tsx`)

A hook that abstracts the complexity of choosing between Local and API actions.

- `addToCart()`: Checks `isGuestMode`. If true, updates local state. If false, calls `cartService.addItem()`.
- `updateItemQuantity()`: Handles local updates or API `PATCH` requests.
- `removeFromCart()`: Handles local removal or API `DELETE` requests.

## 3. The Lifecycle Stages

### Stage 1: Guest Interaction (Unauthenticated)

1. **Selection**: User selects a product.
    - If the product has no variations/addons, they can add it directly from the grid.
    - If it has variations/addons, the system redirects them to the **Product Details** page for configuration.
2. **Stable ID Creation**: `generateCartItemId` is called to create a unique identifier for the specific selection.
3. **Local Storage**: The item is added to the Zustand store and persisted to `localStorage`.
4. **Price Estimation**: Total price is calculated locally based on the base price and selected addons' `extra_price`.

### Stage 2: Authentication & Merging (`useCartMerge.ts`)

This is the most complex part of the flow, triggered after a successful login or signup.

1. **Detection**: `useCartMerge` checks if there are any items in the local guest cart.
2. **Mode Switch**: `setGuestMode(false)` is called to prepare the store for API data.
3. **Transformation**: Local items are transformed into the API-expected format (`GuestCartItem[]`).
4. **Merge Request**: The `POST /cart/merge` endpoint is called with the guest items.
5. **Backend Logic**: The server merges items based on "Smart Matching." If a guest item matches an existing item in the user's account, quantities are summed.
6. **State Update**: The **response** from the merge request is used immediately to populate the cart UI, ensuring zero delay for the user.

### Stage 3: Authenticated Mode (API Sync)

1. **Source of Truth**: The Backend is now the master of all data.
2. **Syncing**: Whenever a user opens the Cart Page or Dropdown, `syncWithAPI()` is called.
    - **Sync Guard**: To optimize performance, if a sync happened in the last 2 seconds (e.g., during the merge), the request is skipped.
3. **Price Finalization**: The local `price` field is overwritten with the server-calculated `total_price / quantity`. This accounts for complex server-side rules like "Flat Fee" vs "Per Unit" addons.

## 4. Specific Functionalities Detail

### Addon Handling

Addons are handled via a complex metadata structure:

- **Local Record**: `addons: { [groupId]: { [itemId]: quantity } }`.
- **API Format**: `addons: Array<{ addon_item_id: number, quantity: number }>`.
- **Utility**: `transformLocalAddonsToApi` handles the conversion between these two formats seamlessly.

### Variation / Variety Handling

- **Variants**: Handled via `product_variant_id`.
- **Display**: The UI uses `item.metadata.variety.name` for display (e.g., "Large - Blue"). This is reconstructed from the API's `variant.title` during synchronization.

### UI Resilience

- **Loading Guards**: `CartPage` and `CartDropdown` check `isLoading` while `items.length === 0`. This prevents "Empty Cart" messages from appearing while the API is still fetching data.
- **Hydration Fix**: `isMounted` checks are used to ensure that server-side rendering doesn't mismatch with client-side `localStorage`.

## 5. Summary of Data Transformation Logic

| Field        | Source (Local)            | Source (API Sync)                 |
| :----------- | :------------------------ | :-------------------------------- |
| **ID**       | Stable Config ID          | Reconstructed Stable ID           |
| **Price**    | Estimated (Base + Addons) | Exact (`total_price` from server) |
| **Quantity** | Local Increment           | Server Count                      |
| **Metadata** | Initial Selection         | Reconstructed from API Response   |

---
