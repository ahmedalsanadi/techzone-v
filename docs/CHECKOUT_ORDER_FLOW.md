# Checkout & Order Flow — Full Documentation

This document describes the end-to-end checkout and order flow: data sources, conditions, order types, API calls, UI states, and system feedback.

---

## 1. High-Level Flow

```
Cart (/cart)  →  Proceed to Checkout  →  Checkout (/checkout)  →  Place Order  →  Result
                     (auth required)         Init + payment              POST /store/orders
                                                      ↓
                                            COD/Wallet → /my-orders/{id}
                                            Epayment  → Gateway → /checkout/result
```

- **Cart**: Shows items and **subtotal only**. No delivery fee; "Delivery fee — Calculated at checkout". No API call to init.
- **Checkout**: Runs **POST /store/orders/init** when context is ready; shows payment methods, summary, wallet. User selects payment and clicks "Place order" → **POST /store/orders**.
- **Result**: After payment (or return from gateway). Shows success with link to order, or failure with links to checkout/cart.

---

## 2. Where Data Comes From

| Data | Source | Notes |
|------|--------|--------|
| Cart items | `useCartStore` | Cart state (from cart API elsewhere). |
| Order type | `useOrderStore.orderType` | `'delivery' \| 'pickup' \| 'dineIn' \| 'carPickup' \| null`. Persisted in localStorage. |
| Delivery address | `useOrderStore.deliveryAddress` | For delivery only. Persisted. |
| Scheduled time | `useOrderStore.scheduledTime`, `orderTime` | "Now" vs "Later"; used for pickup/curbside. |
| Branch | **Not in init payload** | Sent by **proxy** via `x-branch-id` header (from branch cookie). Backend uses it for pickup/dine-in/curbside. |
| Payment methods, wallet, summary, cart_valid | **POST /store/orders/init** | Single source of truth for fees and payment options. |
| Summary line values (subtotal, delivery, COD, tax, total) | **Init response** | We **display** these; we do not recalculate them. |
| Wallet deduction & final total | **Client calculation** | We compute from init’s `summary.total` and user’s "use wallet" choice. |

---

## 3. When Checkout Init Runs (Conditions)

Init is called via **TanStack Query** (`useCheckoutInit`) only when **all** of the following hold:

1. **`canRunInit` is true**:
   - If **delivery**: we require a selected delivery address (`deliveryAddress?.id` present and > 0). Without it we do **not** call init.
   - If **pickup, dine-in, or curbside**: we do **not** require address or branch in the payload; init runs with only `fulfillment_method`. Branch is sent by the proxy in `x-branch-id`.

2. **Query is enabled**: Same as above; when `canRunInit` is false, the query is disabled (no request).

**When init runs again (refetch):**

- When **fulfillment_method** or **address_id** changes (query key changes). So: user changes order type or delivery address → store updates → init runs again with new body.

**When init does NOT run:**

- On the cart page (no init there).
- When user is on delivery but has not selected an address (we show "Select address to continue" and do not call init).

---

## 4. Order Types and How We Handle Them

| Order type (UI) | fulfillment_method (API) | address_id | customer_pickup_datetime | Branch |
|-----------------|--------------------------|------------|--------------------------|--------|
| Delivery | 1 | Required (from `deliveryAddress.id`) | Not sent | N/A |
| Pickup | 2 | Not sent | Required: "Now" → now+30 min; "Later" → scheduled time | From `x-branch-id` header |
| Curbside (car pickup) | 3 | Not sent | Same as pickup | From `x-branch-id` header |
| Dine-in | 4 | Not sent | Not required by API (we still can send for consistency; current code sends for pickup/curbside only) | From `x-branch-id` header |

- **Delivery**: Init and create-order both need `address_id`. We block init until user has selected an address.
- **Pickup / Curbside**: We always send `customer_pickup_datetime` in **YYYY-MM-DD HH:mm:ss**. "Now" uses `earliestPickupDate()` (now + 30 min); "Later" uses `getScheduledTimeAsDate(scheduledTimeRaw)` from the store.
- **Branch**: Never sent in init or create-order **body**. Proxy reads branch from cookie and sets `x-branch-id` on every request to the backend.

---

## 5. API Calls — What, When, Why

### 5.1 POST /store/orders/init

- **When**: When user is on checkout and `canRunInit` is true (see §3). Also refetches when `fulfillment_method` or `address_id` changes.
- **Where**: Triggered by `useCheckoutInit` in `src/hooks/useCheckout.ts`; called via `orderService.checkoutInit` in `src/services/order-service.ts`.
- **Request body**: `{ fulfillment_method: 1|2|3|4, address_id?: number }`. `address_id` only for delivery.
- **Why**: To get payment methods, wallet balance, summary (subtotal, delivery, COD, tax, total), cart validity, and cart issues. Checkout UI is driven by this response.
- **Response (used by UI)**: `payment_methods`, `wallet` (balance, is_active), `summary` (items_subtotal, shipping_fee, cod_fee, tax_amount, total), `cart_valid`, `cart_issues`, plus addresses, fulfillment_methods, settings.

### 5.2 POST /store/orders (create order)

- **When**: User clicks "Place order" on checkout. Only after client-side validation (address for delivery, payment method selected, cart valid, etc.).
- **Where**: `createOrderMutation.mutateAsync(payload)` in checkout page; `orderService.createOrder` in order-service.
- **Request body**: Built by `buildCreateOrderPayload` in `src/app/[locale]/(protected)/checkout/utils.ts`: `fulfillment_method`, `address_id?`, `customer_pickup_datetime?`, `notes`, `payment_method` ('cod' | 'wallet' | 'epayment'), `use_wallet?`, and for epayment: `epayment_method_id`, `success_url`, `error_url`.
- **Why**: To create the order. Backend returns either a redirect URL (epayment) or order id (COD/wallet).
- **Response**: `CreateOrderResponse`: `id`, `order_number`, `redirect_url?`, `attempt_id?`, etc. If `redirect_url` we send user to gateway; else we clear cart and navigate to `/my-orders/{id}`.

### 5.3 GET /store/orders/payment-status/{attemptId}

- **When**: On the **checkout result** page when the URL has `attempt_id` (return from payment gateway). Not called when we already have `order_id` + `status=success` in the URL.
- **Where**: `usePaymentStatus(attemptId)` in `src/hooks/useCheckout.ts`; `orderService.getPaymentStatus` in order-service.
- **Why**: To resolve final payment status (e.g. 4 = paid) and get `order_id` after the user returns from the gateway.
- **Response**: `attempt_id`, `status` (1–6), `status_label`, `order_id?`. We treat status **4** as paid and show success with link to `/my-orders/{order_id}`.

---

## 6. Checkout Page — UI States and Feedback

The checkout page can render in **four** main states:

### 6.1 Loading (init in progress)

- **Condition**: `canRunInit` is true, init query is loading, and we don’t have init data yet.
- **UI**: Full-page spinner + "Loading" text.
- **No** init call when `canRunInit` is false (e.g. delivery without address).

### 6.2 Init error (API error or validation)

- **Condition**: Init was run and returned an error (e.g. 422).
- **UI**: Title, OrderTypeCard (so user can change type/address), and an error card with message from API (`initError`). Buttons: "Choose address or type" (opens modal) and "Retry" (refetches init).
- **Feedback**: Error message comes from `getApiErrorMessage` (supports backend `message` and `errors` shape).

### 6.3 Needs address (delivery without address)

- **Condition**: Order type is delivery and no delivery address is selected (`!canRunInit`), so we never ran init.
- **UI**: Breadcrumbs, title, OrderTypeCard, and a card explaining that user must select an address to continue. Button opens OrderTypeModal to choose address or change order type.
- **No** API call until user selects an address (or switches to pickup/dine-in/curbside).

### 6.4 Main checkout (init success)

- **Condition**: Init succeeded; we have `initData`.
- **UI**: Breadcrumbs, title, optional cart-issues banner (if `!cart_valid`), OrderTypeCard, WalletDiscountCard (if wallet available), PaymentMethodCard, CouponCard, OrderSummaryCard (summary rows + total + Place order).
- **Submit disabled when**: No cart items, cart invalid, no payment method selected (or epayment selected but no gateway chosen). We show a `disabledReason` (e.g. "Select payment method") under the button.
- **Feedback**: 
  - **Before submit**: Toasts for validation (e.g. "Please select address", "Please select payment method").
  - **On create-order error**: Toast with message from `getApiErrorMessage`.
  - **On success (COD/wallet)**: Toast "Order created", cart cleared, redirect to `/my-orders/{id}`.
  - **On success (epayment)**: Redirect to `response.redirect_url` (gateway). After payment, user lands on `/checkout/result` with `attempt_id` (and possibly `order_id` and `status`).

---

## 7. Summary and Totals — API vs Client

- **From API (init response)**  
  We **only display** these (no recalculation):  
  `summary.items_subtotal`, `summary.shipping_fee`, `summary.cod_fee`, `summary.tax_amount`, `summary.total`.

- **Calculated on client**  
  - **Wallet deduction**: When user toggles "use wallet", we set  
    `walletDeduction = min(summary.total - discount, walletBalance)`.  
  - **Final total**: `finalTotal = max(0, summary.total - discount - walletDeduction)`.  
  - **Discount**: Currently fixed at `0` (coupon not wired); placeholder for future.

So: line items and the pre-wallet total come from the backend; we only compute wallet deduction and final total on the client.

---

## 8. Payment Flows

### 8.1 COD or full wallet

- Create order returns `id` (no `redirect_url`). We show success toast, clear cart, and navigate to `/my-orders/{id}`.

### 8.2 Epayment

- Create order returns `redirect_url` (and `attempt_id`). We do `window.location.href = redirect_url`. User pays on gateway and is redirected back to our **success_url** or **error_url**:  
  `/{locale}/checkout/result?status=success` or `?status=error`, with query params such as `attempt_id`, `order_id` (if gateway sends it).

---

## 9. Checkout Result Page — Logic and Feedback

- **URL params we use**: `attempt_id`, `order_id`, `status`.

**Success:**

- If URL has `order_id` and `status=success` and `order_id` is a valid integer → we show success and use that `order_id` for "View order" (no payment-status call).
- Else if we have `attempt_id` and payment-status API returns `status === 4` (paid) and `order_id` → we show success with that `order_id`.

**Failure:**

- No `attempt_id` and no success params (e.g. user landed without return params) → show failed.
- We have `attempt_id` and payment-status returned non-paid or error → show failed; message from `status_label` or i18n.

**Loading:**

- We have `attempt_id` and payment-status request is still in progress → spinner + "Checking payment status...".

**Feedback:**

- Success: Green check, "Order created successfully", button "View order" → `/my-orders/{orderId}`.
- Failure: Red icon, "Payment failed" (or similar), optional message, buttons "Back to checkout" and "Back to cart".

---

## 10. Key Files

| File | Role |
|------|------|
| `src/app/[locale]/(protected)/checkout/page.tsx` | Checkout page: init hook, create-order mutation, all four UI states, validation, submit. |
| `src/app/[locale]/(protected)/checkout/result/page.tsx` | Result page: payment-status query, success/fail/loading views. |
| `src/app/[locale]/(protected)/checkout/utils.ts` | Helpers: orderTypeToFulfillment, formatDateTimeForApi, earliestPickupDate, getDefaultPaymentSelection, buildCreateOrderPayload, buildSummaryItems, isEpaymentValid, parsePaymentResult. |
| `src/hooks/useCheckout.ts` | TanStack Query: useCheckoutInit, useCreateOrder, usePaymentStatus. |
| `src/services/order-service.ts` | API: checkoutInit, createOrder, getPaymentStatus. |
| `src/store/useOrderStore.ts` | Order type, delivery address, scheduled time, order time (now/later). Persisted. |
| `src/app/proxy/[...path]/route.ts` | Adds `x-branch-id` from cookie to backend requests; branch not in init/create body. |
| `src/lib/api-errors.ts` | getApiErrorMessage: unified extraction of user-facing message from ApiError (backend `message` and `errors`). |

---

## 11. Quick Reference — Conditions

| Scenario | Init called? | Create order payload |
|----------|--------------|----------------------|
| Delivery, no address | No | N/A (submit blocked) |
| Delivery, address selected | Yes | fulfillment_method=1, address_id set |
| Pickup / Curbside | Yes | fulfillment_method=2 or 3, customer_pickup_datetime set (now+30 or scheduled) |
| Dine-in | Yes | fulfillment_method=4 |
| Branch | N/A in body | Sent only via `x-branch-id` header by proxy |

This document should be read together with `CHECKOUT_FLOW.md` and `CHECKOUT_REVISION.md` for historical and component-level details.
