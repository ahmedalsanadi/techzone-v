# Checkout & Order Flow Documentation

This document explains the technical flow of order type selection, address management, and checkout integration within the Fasto application.

## 1. Global State Management

The order flow is powered by two main Zustand stores located in `src/store/`:

### `useOrderStore.ts`

Manages the specific details of how the user wants to receive their order.

- **State Details**:
    - `orderType`: `'delivery' | 'pickup' | 'dineIn' | 'carPickup'`.
    - `deliveryAddress`: Object containing `id`, `name` (e.g., "Home"), `formatted` (full address), `latitude`, `longitude`, and `notes`.
    - `orderTime`: `'now' | 'later'`.
    - `scheduledTime`: A Date/ISO string for future orders.
- **Persistence**: Saved to `localStorage` under `order-storage`. This ensures that if a user refreshes the page or returns later, their address and preferred method are remembered.

### `useBranchStore.ts`

Manages the selected physical branch for the order.

- **State Details**:
    - `selectedBranchId`: The ID of the currently active branch.
    - `selectedBranchName`: The name of the branch for immediate UI display.
- **Persistence**: Saved to `localStorage` under `branch-storage`.
- **Note**: Crucial for `pickup` and `dineIn` modes to know which kitchen will receive the order.

---

## 2. Interactive Components Flow

### A. Initial Selection (SubHeader)

Located in `src/components/layouts/SubHeader.tsx`.

- **Function**: Displays the current status (e.g., "توصيل إلى (المنزل) شارع النصر").
- **Logic**:
    - If `delivery` is selected but no address exists, it shows order type buttons.
    - If an address exists, it shows a condensed summary with an "Edit" button that opens the `OrderTypeModal`.

### B. Order Type & Timing (`OrderTypeModal`)

Located in `src/components/modals/OrderTypeModal.tsx`.

- **Purpose**: The central hub for switching between delivery, pickup, and time settings.
- **Flow**:
    1. User selects a type (Delivery/Pickup/etc).
    2. If `Delivery` is chosen, it shows the saved address or an "Add Address" button.
    3. User chooses "Now" or "Later". If "Later", a date/time picker appeared.

### C. Address Management (`AddressModal` & `AddressMap`)

Located in `src/components/modals/`.

- **AddressModal**: Captures the "Name" (e.g., Home) and extra "Notes" (Building, Floor).
- **AddressMap**:
    - **Dynamic Search**: Uses the Nominatim API to allow users to search for places (e.g., "طريق الدمام"). The map reactively flies to the searched location.
    - **Reverse Geocoding**: When a user clicks on the map, it fetches the real street address using the coordinates.
    - **Debouncing**: Search input is debounced (800ms) to prevent excessive API calls while typing.

---

## 3. Checkout Page Integration

The checkout page (`src/app/[locale]/(protected)/checkout/page.tsx`) uses the **`OrderTypeCard`** to display the final state before payment.

### `OrderTypeCard.tsx`

- **Dynamic Connection**: Doesn't take props; it connects directly to `useOrderStore` and `useBranchStore`.
- **Display Logic**:
    - **Delivery**: Shows `(Address Name) Formatted Address` followed by any `Notes`.
    - **Pickup**: Shows the `Branch Name`.
    - **Timing**: Clearly differentiates between "Now" (الآن) and "Later" (لاحقاً) with the formatted date/time.
- **Edit Trigger**: The "تعديل" button opens the same `OrderTypeModal` used in the header, ensuring a consistent experience.

---

## 4. Localization (i18n)

Translations are managed in `src/messages/`.

- **Key Namespace**: `Checkout`.
- **Support**: Fully supports Arabic (RTL) and English (LTR).
- **Formatting**: Arabic addresses use specific formatting like `(المنزل)` for the address label to match the design aesthetic.

## 5. Summary of Data Flow

1. **User Input**: `AddressModal` (Map search/click) -> `Address Name` & `Notes`.
2. **Store Update**: Data saved into `useOrderStore` + LocalStorage.
3. **UI Sync**: `SubHeader` and `OrderTypeCard` re-render immediately to show the new address with the `(Name) Address` format.
4. **Checkout**: Final data is ready in the store to be sent to the backend Create Order API.
