# Order & Checkout Behavior

This document describes **when** the user can cancel an order, rate an order, rate an order item (product), and what situations the checkout page can be in.

---

## 1. Order status reference (API → UI)

The API returns `order.status` as a number. The app maps it to a string key used for conditions:

| API `status` | Key | Meaning |
|--------------|-----|---------|
| 1 | `WAITING_APPROVAL` | Order created (e.g. COD), waiting for store approval |
| 2 | `WAITING_PAYMENT` | Payment not completed (e.g. user left before finishing epayment) |
| 3 | `PAID` | Paid |
| 4 | `IN_PROCESS` | In progress / being prepared |
| 5 | `READY_FOR_PICKUP` | Ready for pickup |
| 6 | `SHIPPED` | With courier / shipped |
| 7 | `DELIVERED` | Delivered |
| 11 | `COMPLETED` | Completed (e.g. picked up) |
| 8 | `CANCELED` | Canceled |
| 9 | `REFUNDED` | Refunded |
| 10 | `PARTIALLY_REFUNDED` | Partially refunded |

See `ORDER_STATUS_NUMBER_MAP` in `src/types/orders/orders.types.ts`.

---

## 2. When can the user cancel the order?

**Location:** Order details page (`OrderDetailsView.tsx`). The "Cancel order" button is shown only when the order is cancelable.

**Condition:**

- Order status is **`WAITING_APPROVAL`** (1), or  
- Order status is **`WAITING_PAYMENT`** (2).

**Code:** `isCancelable = (currentStatusKey === 'WAITING_APPROVAL' || currentStatusKey === 'WAITING_PAYMENT')`.

Once the order is **PAID** (3) or any later status (In Process, Ready for pickup, Shipped, Delivered, Completed), the Cancel button is **not** shown. Terminal states (Canceled, Refunded, Partially refunded) also do not show Cancel.

---

## 3. When can the user rate the order?

**Location:** Order details page (`OrderDetailsView.tsx`). The "Rate order" button appears in the action bar next to Report problem, Reorder, and (when applicable) Cancel.

**Conditions (all required):**

1. Order status is **`DELIVERED`** (7) or **`COMPLETED`** (11).
2. The order does **not** already have a review (`!order.review`).

**Code:**  
`(currentStatusKey === 'DELIVERED' || currentStatusKey === 'COMPLETED') && !order.review`

After the user submits an order-level review, `order.review` is set (e.g. `{ rate, comment }`) and the button is replaced by the displayed order rating (star + value).

---

## 4. When can the user rate an order item (product)?

**Location:** Order details page, inside **OrderProductsCard**: each line item can show either a "Rate product" button or the product’s existing rating.

**Conditions (all required):**

1. Order status is **`DELIVERED`** (7) or **`COMPLETED`** (11) (passed as `orderStatus` to `OrderProductsCard`).
2. The **item** does **not** already have a review (`!item.review`).

**Code (OrderProductsCard):**  
`(orderStatus === 'DELIVERED' || orderStatus === 'COMPLETED') && (item.review ? show rating : show "Rate product" button)`

So:

- **Order rating:** one review per order (when status is Delivered/Completed and no order review yet).
- **Product rating:** one review per order **item** (when status is Delivered/Completed and that item has no review yet).

Both use the same `ReviewModal`; the type sent to the API is either `ORDER` or `PRODUCT` (with `product_id` for product reviews).

---

## 5. Checkout page: different situations

The checkout page (`src/app/[locale]/(protected)/checkout/page.tsx`) can render in several distinct states depending on init, address, and cart.

### 5.1 Initial load / loading

- **When:** Init is enabled (`canRunInit`) and the first init request is in flight, and there is no cached `initData` yet.
- **UI:** Full-page **skeleton** (`CheckoutPageSkeleton`).
- **Note:** If the user has not chosen an address (delivery) or order type, `canRunInit` may be false and the page can go straight to "needs address or type" (see below).

### 5.2 Init error

- **When:** Init has been run and returned an **error** (`initError` is set) and there is no successful `initData`.
- **UI:**  
  - Title "Checkout".  
  - Order type card (so user can change type/address).  
  - Amber error box with `initError` message and hint "Please select a delivery address or change to pickup, then retry."  
  - Buttons: **"Choose address or order type"** (scrolls to order type card), **"Retry"** (refetches init).
- **Purpose:** Let the user fix address/type or retry after a transient failure.

### 5.3 Needs address or order type

- **When:** Init **cannot** run yet: `!canRunInit && !initData`.  
  Typical case: order type is **delivery** but no delivery address is selected (`deliveryAddress` missing or no `id`).
- **UI:**  
  - Breadcrumbs, title "Checkout".  
  - Order type card.  
  - Primary info box: "Choose where to receive your order" and short hint.  
  - Button **"Choose address or order type"** to open the order type modal.
- **Purpose:** Block proceeding until the user selects an address (for delivery) or switches to pickup/curbside/dine-in.

### 5.4 Full checkout (ready to pay)

- **When:** Init has succeeded (`initData` is set) and we are not in the init-error or needs-address/type state.
- **UI:**  
  - Breadcrumbs, title.  
  - **Order type & time** card (with optional shipping speed for delivery).  
  - **Payment method** card (COD, epayment, wallet when available).  
  - **Shipping speed** card (only when order type is delivery and init returns `shipping_speed_types`).  
  - **Coupon** card.  
  - **Order notes** card (textarea, optional).  
  - **Order summary** card (totals + **Submit order** button).

**Submit button disabled when:**

- Cart is empty (`items.length === 0`), or  
- Cart is invalid (`!cart_valid`), or  
- Payment is required but not selected: not fully wallet-covered **and** no `selectedPaymentMethodType`, or  
- Epayment is selected but no gateway is chosen (`selectedPaymentMethodType === 'epayment' && !selectedEpaymentMethodId`).

**Disabled reason** shown under the button (e.g. "Cart has issues", "Please select a payment method", "Select payment method" for epayment).

**On submit:**

- Build payload: `fulfillment_method`, `address_id` (delivery), `customer_pickup_datetime` (pickup/curbside), `notes`, `payment_method`, and for epayment: `epayment_method_id`, `success_url`, `error_url`. Wallet can reduce the amount; payment method can be `cod`, `wallet`, or `epayment`.
- **Epayment:** API returns `redirect_url` → user is redirected to the gateway; after payment they return to `/checkout/result` and the app polls payment status then redirects to the order or shows failure.
- **COD / Wallet:** Order is created immediately; cart is cleared and user is redirected to `/my-orders/{order_id}`.

### 5.5 Summary table

| Situation | Condition | What user sees |
|-----------|-----------|----------------|
| Loading | Init in progress, no init data yet, init allowed | Skeleton |
| Init error | Init failed, no init data | Error message + order type card + Retry / Choose address or type |
| Needs address/type | Init not runnable (e.g. delivery, no address) | Order type card + "Select address to continue" + CTA |
| Full checkout | Init succeeded | Order type, payment, shipping (if delivery), coupon, notes, summary; submit enabled when cart valid and payment selected |

---

## 6. Related files

- **Order details (cancel, rate order, rate product):** `src/components/orders/OrderDetailsView.tsx`  
- **Product rating UI:** `src/components/orders/OrderProductsCard.tsx`  
- **Checkout page:** `src/app/[locale]/(protected)/checkout/page.tsx`  
- **Order status mapping:** `src/types/orders/orders.types.ts`  
- **Checkout init & create order:** `docs/CHECKOUT_FLOW.md`
