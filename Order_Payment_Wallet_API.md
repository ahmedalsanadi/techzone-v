# Store API Documentation

## Base Information

- **Base URL**: `{{base_url}}`
- **Required Headers**:
    - `X-Store-Key`: `{{store_key}}` (for all requests)
    - `Accept`: `application/json` (for all requests)
    - `Authorization`: `Bearer {{customer_token}}` (for customer-specific endpoints)
    - `X-Branch-Id`: `{{branch_id}}` (for branch-specific operations)

---

## 📦 Orders Endpoints

### 1. List Orders

**GET** `{{base_url}}/store/orders`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)

**Description:** Retrieve paginated list of customer orders.

**Response Example:**

```json
{
    "success": true,
    "message": "تم جلب الطلبات بنجاح",
    "data": [
        {
            "id": 1,
            "branch_id": 5,
            "branch_name": "الفرع الرئيسي",
            "status": "WAITING_APPROVAL",
            "status_label": "بانتظار الموافقة",
            "fulfillment_method": 1,
            "fulfillment_label": "التوصيل للموقع",
            "items_count": 3,
            "total_quantity": 5,
            "items_subtotal": 250.0,
            "items_discount": 25.0,
            "items_total": 225.0,
            "shipping_fee": 15.0,
            "cod_fee": 5.0,
            "subtotal": 240.0,
            "total": 245.0,
            "wallet_deduction": 0.0,
            "customer_pickup_datetime": null,
            "items": [
                {
                    "id": 101,
                    "product_id": 50,
                    "product_variant_id": null,
                    "product_title": "قهوة تركية",
                    "product_type": "simple",
                    "is_variation": false,
                    "quantity": 2,
                    "unit_price": 25.0,
                    "sale_unit_price": 20.0,
                    "total_price": 40.0,
                    "total_discount": 10.0,
                    "tax_rate": 15.0,
                    "total_tax": 6.0,
                    "addons": [],
                    "custom_fields": {},
                    "variant_options": [],
                    "notes": "سكر متوسط",
                    "status": "PENDING",
                    "status_label": "معلق",
                    "product_image": "https://example.com/images/coffee.jpg"
                }
            ],
            "metadata": {
                "address_id": 12,
                "notes": "الرجاء الاتصال قبل التوصيل"
            },
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 75
    }
}
```

### 2. Order Details

**GET** `{{base_url}}/store/orders/{id}`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**URL Parameters:**

- `id` (required): Order ID

**Description:** Get detailed information about a specific order.

**Response Example:**

```json
{
    "success": true,
    "message": "تم جلب تفاصيل الطلب بنجاح",
    "data": {
        "id": 1,
        "branch_id": 5,
        "branch_name": "الفرع الرئيسي",
        "customer_id": 100,
        "customer": {
            "id": 100,
            "name": "محمد أحمد",
            "phone": "+966501234567"
        },
        "status": "WAITING_APPROVAL",
        "status_label": "بانتظار الموافقة",
        "fulfillment_method": 1,
        "fulfillment_label": "التوصيل للموقع",
        "items_count": 3,
        "total_quantity": 5,
        "items_subtotal": 250.0,
        "items_discount": 25.0,
        "items_total": 225.0,
        "items_tax": 33.75,
        "shipping_fee": 15.0,
        "cod_fee": 5.0,
        "subtotal": 240.0,
        "total": 245.0,
        "wallet_deduction": 50.0,
        "customer_pickup_datetime": null,
        "items": [
            {
                "id": 101,
                "product_id": 50,
                "product_variant_id": null,
                "product_title": "قهوة تركية",
                "product_type": "simple",
                "is_variation": false,
                "quantity": 2,
                "unit_price": 25.0,
                "sale_unit_price": 20.0,
                "total_price": 40.0,
                "total_discount": 10.0,
                "tax_rate": 15.0,
                "total_tax": 6.0,
                "addons": [
                    {
                        "id": 1,
                        "name": "كريمة",
                        "price": 3.0
                    }
                ],
                "custom_fields": {},
                "variant_options": [],
                "notes": "سكر متوسط",
                "status": "PENDING",
                "status_label": "معلق",
                "product_image": "https://example.com/images/coffee.jpg"
            }
        ],
        "address_id": 12,
        "notes": "الرجاء الاتصال قبل التوصيل",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
}
```

### 3. Create Order (Checkout)

**POST** `{{base_url}}/store/orders`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Content-Type`: `application/json`
- `Accept`: `application/json`

**Request Body:**

```json
{
    "fulfillment_method": 1,
    "address_id": 12,
    "payment_method": "cod",
    "customer_pickup_datetime": null,
    "notes": "الرجاء الاتصال قبل التوصيل"
}
```

**Field Details:**

- `fulfillment_method` (required): Delivery method
    - `1` = Delivery to location
    - `2` = Pickup from branch
    - `3` = Curbside Pickup
    - `4` = Dine-in
- `payment_method` (required): Payment method
    - `cod` = Cash on delivery
    - `wallet` = Wallet payment
    - `card` = Card payment (coming soon)
- `address_id` (conditional): Address ID (required if fulfillment_method = 1)
- `customer_pickup_datetime` (conditional): Pickup datetime in ISO format (required if fulfillment_method = 2 or 3)
- `notes` (optional): Order notes (max 500 characters)

**Validation Rules:**

- `customer_pickup_datetime` must be a future date/time
- `notes` maximum length: 500 characters

**Response Example:**

```json
{
    "success": true,
    "message": "تم إنشاء الطلب بنجاح",
    "data": {
        "id": 123,
        "order_number": "ORD-2024-00123",
        "status": "WAITING_APPROVAL",
        "status_label": "بانتظار الموافقة",
        "total": 245.0,
        "estimated_delivery_time": "30-45 دقيقة",
        "payment_method": "cod",
        "created_at": "2024-01-15T10:30:00Z"
    }
}
```

### 4. Cancel Order

**POST** `{{base_url}}/store/orders/{id}/cancel`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**URL Parameters:**

- `id` (required): Order ID

**Description:** Cancel an order if it's in a cancelable state.

**Cancelable Statuses:**

- `WAITING_APPROVAL` - Waiting for approval
- `WAITING_PAYMENT` - Waiting for payment

**Response Example:**

```json
{
    "success": true,
    "message": "تم إلغاء الطلب بنجاح",
    "data": {
        "id": 1,
        "status": "CANCELLED",
        "status_label": "ملغى",
        "cancelled_at": "2024-01-15T10:35:00Z"
    }
}
```

**Error Response (if not cancelable):**

```json
{
    "success": false,
    "message": "لا يمكن إلغاء الطلب في حالته الحالية",
    "errors": {
        "status": ["الطلب غير قابل للإلغاء"]
    }
}
```

---

## 💳 Payment Methods Endpoints

### 1. Get Payment Methods

**GET** `{{base_url}}/store/payment-methods`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `Accept`: `application/json`

**Description:** Get available payment methods for the store. Only returns active payment methods from active gateways.

**Response Example:**

```json
{
    "success": true,
    "message": "تم جلب طرق الدفع بنجاح",
    "data": [
        {
            "type": "epayment",
            "name": "الدفع الإلكتروني",
            "description": "الدفع عبر بوابات الدفع الإلكترونية (بطاقة ائتمان، Apple Pay، إلخ)",
            "icon": "credit-card",
            "available": true,
            "gateways": [
                {
                    "id": 1,
                    "name": "Moyasar Gateway",
                    "slug": "moyasar",
                    "description": "Moyasar payment gateway for Saudi Arabia",
                    "logo": null,
                    "supports_libero": true,
                    "supports_direct": true
                },
                {
                    "id": 2,
                    "name": "Hyperpay Gateway",
                    "slug": "hyperpay",
                    "description": "Hyperpay payment gateway",
                    "logo": null,
                    "supports_libero": true,
                    "supports_direct": true
                },
                {
                    "id": 3,
                    "name": "PayPal Gateway",
                    "slug": "paypal",
                    "description": "PayPal payment gateway",
                    "logo": null,
                    "supports_libero": false,
                    "supports_direct": true
                }
            ]
        },
        {
            "type": "cod",
            "name": "الدفع عند الاستلام",
            "description": "الدفع نقداً عند استلام الطلب",
            "icon": "cash",
            "available": true,
            "max_amount": 5000
        },
        {
            "type": "wallet",
            "name": "المحفظة",
            "description": "الدفع من رصيد المحفظة",
            "icon": "wallet",
            "available": true,
            "can_combine": true
        }
    ]
}
```

### 2. Get Payment Gateways

**GET** `{{base_url}}/store/payment-gateways`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `Accept`: `application/json`

**Description:** Get available payment gateways for the store. Only returns active gateways configured for this store.

**Response Example:**

```json
{
    "success": true,
    "message": "تم جلب بوابات الدفع بنجاح",
    "data": [
        {
            "id": 1,
            "name": "Moyasar Gateway",
            "slug": "moyasar",
            "description": "Moyasar payment gateway for Saudi Arabia",
            "logo": "https://example.com/moyasar-logo.png",
            "supports_libero": true,
            "supports_direct": true
        },
        {
            "id": 2,
            "name": "Hyperpay Gateway",
            "slug": "hyperpay",
            "description": "Hyperpay payment gateway",
            "logo": "https://example.com/hyperpay-logo.png",
            "supports_libero": true,
            "supports_direct": true
        },
        {
            "id": 3,
            "name": "PayPal Gateway",
            "slug": "paypal",
            "description": "PayPal payment gateway",
            "logo": "https://example.com/paypal-logo.png",
            "supports_libero": false,
            "supports_direct": true
        }
    ]
}
```

**Field Descriptions:**

- `supports_libero`: Whether the gateway supports Libero payment flow
- `supports_direct`: Whether the gateway supports direct payment processing

---

## 💰 Wallet Endpoints

### 1. Get Wallet Balance

**GET** `{{base_url}}/store/wallet`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**Description:** Retrieve customer's wallet balance information.

**Response Example:**

```json
{
    "success": true,
    "message": "تم جلب رصيد المحفظة بنجاح",
    "data": {
        "balance": 1175,
        "pending_balance": 0,
        "is_active": true
    }
}
```

**Field Descriptions:**

- `balance`: Available balance for immediate use
- `pending_balance`: Balance pending from recent transactions (not yet available)
- `is_active`: Whether the wallet is active/enabled

### 2. Get Wallet Transactions

**GET** `{{base_url}}/store/wallet/transactions`

**Headers:**

- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**Query Parameters:**

- `per_page` (optional): Items per page (default: 15)
- `page` (optional): Page number (default: 1)

**Description:** Retrieve paginated list of wallet transactions.

**Response Example:**

```json
{
    "success": true,
    "message": "تم جلب حركات المحفظة بنجاح",
    "data": [
        {
            "id": 5,
            "amount": 100,
            "balance_before": 1075,
            "balance_after": 1175,
            "type": 1,
            "type_label": "إيداع",
            "description": "هدية ترحيبية",
            "reference": "ORD-3",
            "created_at": "2026-02-04 18:00:42"
        },
        {
            "id": 4,
            "amount": 100,
            "balance_before": 975,
            "balance_after": 1075,
            "type": 3,
            "type_label": "استرداد",
            "description": "تعويض عن تأخر التوصيل",
            "reference": "ORD-2",
            "created_at": "2026-02-04 18:00:42"
        },
        {
            "id": 3,
            "amount": 500,
            "balance_before": 475,
            "balance_after": 975,
            "type": 1,
            "type_label": "إيداع",
            "description": "هدية ترحيبية",
            "reference": "ORD-7",
            "created_at": "2026-02-04 18:00:42"
        },
        {
            "id": 2,
            "amount": -25,
            "balance_before": 500,
            "balance_after": 475,
            "type": 4,
            "type_label": "تعديل",
            "description": "تصحيح رصيد",
            "reference": "ORD-4",
            "created_at": "2026-02-04 18:00:42"
        },
        {
            "id": 1,
            "amount": 500,
            "balance_before": 0,
            "balance_after": 500,
            "type": 1,
            "type_label": "إيداع",
            "description": "مكافأة الإحالة",
            "reference": "ORD-3",
            "created_at": "2026-02-04 18:00:42"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 5
    }
}
```

**Transaction Types:**

- `1` = إيداع (deposit) - Positive amount
- `2` = سحب (withdrawal) - Negative amount
- `3` = استرداد (refund) - Positive amount
- `4` = تعديل (adjustment) - Can be positive or negative

**Transaction Statuses:**

- `pending` - Transaction is being processed
- `completed` - Transaction completed successfully
- `failed` - Transaction failed
- `cancelled` - Transaction was cancelled

---

## 🔧 Common Error Responses

### Authentication Error

```json
{
    "success": false,
    "message": "يجب تسجيل الدخول",
    "errors": {
        "auth": ["غير مصرح بالوصول"]
    }
}
```

### Validation Error

```json
{
    "success": false,
    "message": "بيانات غير صالحة",
    "errors": {
        "address_id": ["عنوان التوصيل مطلوب"],
        "customer_pickup_datetime": ["موعد الاستلام يجب أن يكون في المستقبل"]
    }
}
```

### Not Found Error

```json
{
    "success": false,
    "message": "الطلب غير موجود",
    "errors": {
        "order": ["تعذر العثور على الطلب المطلوب"]
    }
}
```

---

## 📋 Notes

1. **Authentication**: Customer endpoints require `Authorization: Bearer {{customer_token}}` header
2. **Branch Context**: Some operations require `X-Branch-Id` header for branch-specific pricing and inventory
3. **Currency**: All amounts are in the store's base currency (SAR by default)
4. **Time Format**: All datetime fields are in ISO 8601 format (UTC)
5. **Pagination**: Lists are paginated with `data` array and `meta` information
6. **Validation**: Always validate request body before sending as shown in field details
