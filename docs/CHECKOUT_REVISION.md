# Checkout & Order Flow — Revision Notes

Critical review of the checkout implementation against `Order-endpoint.md` and UX. Fixes applied and remaining considerations.

---

## 1. API Contract (Order-endpoint.md)

### Fixed

- **customer_pickup_datetime**: API requires this when `fulfillment_method` is 2 (pickup) or 3 (curbside). We now always send it for pickup/curbside: when "Now" we send current time + 30 min as `YYYY-MM-DD HH:mm:ss`; when "Later" we send the scheduled time in the same format. Dine-in (4) does not require it per the doc.
- **Init only when context is valid**: We require `address_id` for delivery before calling `POST /store/orders/init`. For pickup/dine-in/curbside we do **not** require branch in the payload or in UI — the backend receives branch via the `x-branch-id` header (set by the proxy from the branch cookie). So we only gate init on delivery + address.
- **Create-order payload**: `address_id` only for delivery; `customer_pickup_datetime` only for pickup/curbside (and formatted as above). Epayment sends `epayment_method_id`, `success_url`, `error_url`.

### Checked

- **Fulfillment mapping**: 1=delivery, 2=pickup, 3=curbside, 4=dine-in. `orderTypeToFulfillment` matches.
- **Payment method values**: We send `payment_method: 'epayment' | 'cod' | 'wallet'` (no legacy `'card'`).
- **Response handling**: Epayment returns `redirect_url` + `attempt_id`; we redirect to `redirect_url`. COD/wallet return `id`; we redirect to `/my-orders/{id}`.

---

## 2. Checkout Page (`page.tsx`)

### Fixed

- **canRunInit**: Requires only (delivery + valid `address_id`). For pickup/dine-in/curbside we allow init without checking branch — branch is sent in the `x-branch-id` header by the proxy (from cookie), not in the init body.
- **Pickup datetime**: Helpers `formatDateTimeForApi` and `earliestPickupDate()` added; pickup/curbside always get a valid `customer_pickup_datetime`.
- **useBranchStore**: Removed from checkout page; branch is not part of the init payload and is provided via header.

### Checked

- **runInit deps**: `fulfillment_method`, `address_id`, `t`. Correct.
- **Init body**: We only add `address_id` when defined, so no `undefined` in JSON.
- **Error parsing**: `getInitErrorMessage` reads Laravel-style `errors` and `message`. Good for 422.
- **Three states**: Loading, init error (with OrderTypeCard + CTA + Retry), needs-address/branch (same CTA, no init call). Consistent.

---

## 3. Checkout Result Page (`result/page.tsx`)

### Fixed

- **Success after getPaymentStatus**: We no longer auto-redirect with `router.replace`. We set `orderId` and `status='success'` and render the success view with "View order". User sees confirmation before navigating.
- **Unused router**: Removed `useRouter` and `router` from deps.

### Checked

- **URL params**: We read `attempt_id`, `order_id`, `status`. When gateway sends `order_id` + `status=success` we show success without calling the API. When only `attempt_id` we call `getPaymentStatus`.
- **PAYMENT_STATUS_PAID = 4**: Matches doc (4 = Paid).

---

## 4. OrderTypeCard (`OrderTypeCard.tsx`)

### Checked

- **openModal / onModalOpened**: Effect opens the modal when parent sets `openModal` and calls `onModalOpened` so the parent can reset. Correct.
- **Store usage**: `useOrderStore` and `useBranchStore`; displays delivery address or branch name and time. No change needed.
- **Default props**: `OrderTypeCardProps = {}` and `openModal = false` are correct.

---

## 5. PaymentMethodCard (`PaymentMethodCard.tsx`)

### Fixed

- **Empty state**: When `methodsToShow.length === 0` we show `t('noPaymentMethodsAvailable')` instead of an empty grid.
- **i18n**: Replaced hardcoded "اختر طريقة الدفع" with `t('selectEpaymentMethod')` and "حتى X ر.س" with `t('codMaxAmount', { amount })`.
- **External images**: Using `<img>` for `option.image_url` to avoid Next/Image host restrictions.

### Checked

- **COD max_amount**: We disable the COD option when `summaryTotal > max_amount` and show the limit. Correct.
- **Epayment list**: We use `epayment_methods` from init; selection is `selectedEpaymentMethodId`. Matches API.
- **Unused props**: `useWallet` and `walletCoversTotal` are passed but not used in the component; they are reserved for future behavior (e.g. hiding other methods when wallet covers full amount). No bug.

---

## 6. OrderSummaryCard (`OrderSummaryCard.tsx`)

### Fixed

- **Stable keys**: List items use `key={\`${item.label}-${index}\`}` instead of `key={index}` to avoid key collisions when labels repeat.
- **disabledReason**: New optional prop; when the button is disabled we show the reason below it (e.g. cart invalid, please select payment method). Checkout page passes a reason when disabled.

### Checked

- **Summary order**: Rows are built by the parent from init `summary`; value/label order is consistent. RTL is handled by layout.
- **Submit button**: Disabled and loading states are correct; `onSubmit` is optional.

---

## 7. WalletDiscountCard (`WalletDiscountCard.tsx`)

### Checked

- **i18n**: Uses `t('walletDiscountTitle')`, `t('walletBalanceLabel')`, `t('yes')`, `t('no')`. No hardcoded copy.
- **Visibility**: Rendered only when checkout page has `walletAvailable` (init wallet active and balance > 0). Correct.
- **CheckoutCard**: Used without title; card layout is fine.

---

## 8. CheckoutCard (`CheckoutCard.tsx`)

### Checked

- **Generic layout**: Optional `title` and `action`; children for content. No change needed.
- **No i18n**: Title/action come from parents; no hardcoded strings here.

---

## 9. Stores (useOrderStore, useBranchStore, useAddressStore)

### Checked

- **useOrderStore**: `orderType`, `deliveryAddress`, `scheduledTime`, `orderTime`. Persisted; used for init and create order. `deliveryAddress.id` is the backend address id for init/order. No change.
- **useBranchStore**: Branch is sent to the API via the `x-branch-id` header (proxy reads branch cookie). Checkout does not require branch in init or in UI for pickup/dine-in/curbside; backend uses the header.
- **useAddressStore**: Guest address only; checkout uses `useOrderStore.deliveryAddress` (from OrderTypeModal/address flow). No direct use in checkout page; no change.

---

## 10. Types (`src/types/orders.ts`)

### Checked

- **CreateOrderRequest**: Has `epayment_method_id`, `success_url`, `error_url`; `payment_method` is `'epayment'|'cod'|'wallet'`. Matches API.
- **CreateOrderResponse**: Has `redirect_url`, `attempt_id`; `id` for COD/wallet. Matches API.
- **CheckoutInitRequest/Response**: Matches init request/response. Payment methods include `epayment_methods`. No change.

---

## 11. Cart Page (`cart/page.tsx`)

### Checked

- **Subtotal only**: No delivery fee number; "Calculated at checkout" and total = subtotal. Matches plan.
- **No init**: Cart does not call checkout init. Correct.

---

## 12. UX / Copy

### Fixed

- **selectAddressToContinueHint**: Updated to mention both delivery (address) and pickup (branch): "Delivery requires an address; pickup requires a branch. Use the section above to choose and see the total."
- **New keys**: `selectEpaymentMethod`, `codMaxAmount`, `noPaymentMethodsAvailable` for PaymentMethodCard (EN + AR).

---

## 13. What We Did Not Change

- **OrderTypeModal**: Still used for address and order type; no API or flow change.
- **SubHeader / layout / providers**: Not in scope for this revision.
- **CouponCard**: Still present; no integration with init/create order in this pass.
- **Cart sync**: Guest vs auth and merge flow unchanged.
- **Branch cookie**: Still set by useBranchStore; proxy and init/order rely on it.

---

## 14. Optional Follow-ups (Not Done)

- **RTL summary row order**: OrderSummaryCard could swap label/value order by locale for better RTL reading. Low impact.
- **Pickup “now” time**: We use now + 30 min; backend might accept “as soon as possible” or a different offset. Can be tuned with backend.
- **Dine-in datetime**: API does not require `customer_pickup_datetime` for dine-in (4); we don’t send it. If backend starts requiring it, add the same logic as pickup/curbside.

This revision aligns behavior with the API, improves init/order payloads, and tightens UX (success screen, empty states, disabled reasons, copy).
