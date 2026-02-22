# Checkout & Order Flow Documentation

This document explains the technical flow of order type selection, address management, checkout initialization (init), and payment within the application.

---

## 1. Cart vs Checkout

- **Cart page** (`/cart`): Shows cart items and a **subtotal only**. Delivery fee is not calculated on the cart; one line shows "Delivery fee — Calculated at checkout" (or i18n equivalent). **Total = Subtotal**. No call to checkout/init; the cart does not require address or order type. "Proceed to Checkout" only navigates to `/checkout` (auth required; guests are redirected to login first).
- **Checkout page** (`/checkout`): Loads all data via **POST /store/orders/init** (fulfillment method and, for delivery, address). Init returns payment methods, wallet balance, summary (subtotal, shipping_fee, cod_fee, tax, total), cart validity, and addresses. The checkout page uses this as the single source of truth for fees and payment options. Init is called again when the user changes order type or delivery address.

---

## 2. When Checkout Init Is Called

- **On checkout page load**: With current `fulfillment_method` (from `useOrderStore.orderType`) and `address_id` (from `useOrderStore.deliveryAddress?.id` when order type is delivery). If the user has not selected an address yet, init is still called without `address_id`; the backend may return a summary with zero or no shipping until an address is selected.
- **When order type or address changes**: Changing order type (e.g. delivery ↔ pickup) or delivery address in `OrderTypeModal` updates `useOrderStore`. The checkout page effect depends on `fulfillment_method` and `address_id`, so init runs again and the summary (and payment method availability) updates.

Init is **not** called on the cart page or when the user clicks "Proceed to Checkout".

---

## 3. Global State Management

### `useOrderStore.ts` (`src/store/useOrderStore.ts`)

- **State**: `orderType`, `deliveryAddress`, `customerPickupDatetime`, `orderTime`, `notes`.
- **Persistence**: `localStorage` under `order-storage`.
- Used by checkout to build init request and create-order payload. Default `orderType` is `'delivery'`.

### `useBranchStore.ts` (`src/store/useBranchStore.ts`)

- **State**: `selectedBranchId`, `selectedBranchName`, etc.
- **Persistence**: `localStorage` under `branch-storage`.
- Branch context is sent to the API via `x-branch-id` header (cookies). Init request does not send branch in the body; backend uses the header.

---

## 4. Checkout Page Flow

1. **Mount**: Read `orderType` and `deliveryAddress` from `useOrderStore`. Map `orderType` to `fulfillment_method` (1=delivery, 2=pickup, 3=curbside, 4=dine-in). Call **POST /store/orders/init** with `{ fulfillment_method, address_id? }`.
2. **Init response**: Store `payment_methods`, `wallet`, `summary`, `cart_valid`, `cart_issues`, `addresses`, `fulfillment_methods`, `settings`. If `!cart_valid`, show issues and block "Place order".
3. **Re-init**: When `fulfillment_method` or `address_id` changes (user edits type/address in OrderTypeCard/OrderTypeModal), run init again.
4. **Payment UI**: Driven by init’s `payment_methods` (epayment with `epayment_methods[]`, COD with `max_amount`, wallet). Wallet card is shown only when wallet is available and balance > 0.
5. **Submit**: Build create-order payload (fulfillment_method, address_id, customer_pickup_datetime, notes, payment_method, and for epayment: epayment_method_id, success_url, error_url). Call **POST /store/orders**. On epayment response with `redirect_url`, redirect to the gateway; on COD/wallet success, clear cart and redirect to order detail.
6. **Payment return**: After gateway redirect, the app uses **/checkout/result** (with `attempt_id` and optionally `order_id` in query). It calls **GET /store/orders/payment-status/{attemptId}** and redirects to `/my-orders/{order_id}` on success or shows failure with links to checkout/cart.

---

## 5. Interactive Components

- **OrderTypeCard**: Displays current order type and address/branch and time. "Edit" opens `OrderTypeModal`. No props; reads from `useOrderStore` and `useBranchStore`.
- **OrderTypeModal**: User changes order type, delivery address, or scheduled time. Updates stores; checkout page effect re-runs init.
- **PaymentMethodCard**: Receives `payment_methods` and `summary` from init. Shows COD (with max_amount check), epayment (with `epayment_methods` list), and hides wallet (handled by WalletDiscountCard).
- **WalletDiscountCard**: Shown only when init reports wallet available and balance > 0. "Use wallet" toggle; balance from init.
- **OrderSummaryCard**: Receives summary rows and total from checkout page (derived from init’s `summary` and optional wallet deduction). No local fee state.

---

## 6. Localization (i18n)

Translations are in `src/messages/` under the `Checkout` (and related) namespaces. Arabic (RTL) and English (LTR) are supported. Address formatting uses `(label)` style for the address name where applicable.

---

## 7. Summary of Data Flow

1. **Cart**: User sees items and subtotal; delivery line is "Calculated at checkout". No init.
2. **Proceed to Checkout**: Navigate to `/checkout` (auth required).
3. **Checkout load**: Init with current fulfillment and address_id → payment methods, wallet, summary, cart_valid.
4. **User changes type/address**: Store updates → init runs again → summary and options update.
5. **Place order**: Create order with chosen payment (epayment/cod/wallet). Epayment → redirect to gateway → return to `/checkout/result` → payment-status → redirect to order or show failure.
6. **Order type and address**: Stored in `useOrderStore`; address id (for delivery) is the backend address id used in init and create order.

---

## 8. Related: When to cancel, rate order, rate product, checkout states

See **docs/ORDER_AND_CHECKOUT_BEHAVIOR.md** for when the user can cancel an order, rate the order, rate an order item (product), and for a breakdown of all checkout page situations (loading, init error, needs address/type, full checkout).
