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

### 1. Checkout Initialization
**POST** `{{base_url}}/store/orders/init`

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
    "address_id": 1
}
```

**Required Fields:**
- `fulfillment_method`: Delivery method (1=delivery, 2=pickup, 3=curbside, 4=dine-in)

**Conditional Fields:**
- `address_id`: Customer address ID — required only if `fulfillment_method = 1` (delivery)

**Description:** Initialize checkout page. Validates cart and returns all data needed for checkout page.

**Response Data:**
- `cart`: Current cart data with items
- `cart_valid`: Whether cart is valid for purchase
- `cart_issues` / `cart_warnings`: Cart problems and warnings
- `addresses`: List of customer addresses
- `fulfillment_methods`: Available fulfillment methods (filtered by store type)
- `shipping_options`: Shipping options (only for stores, not restaurants)
- `payment_methods`: Available payment methods
- `wallet`: Customer wallet balance
- `summary`: Estimated price summary
- `settings`: Order settings

**Notes:**
- Store supports: Delivery + Pickup from branch
- Restaurant supports: All fulfillment methods including Curbside and Dine-in
- `shipping_options` not shown for restaurants (delivery via Captain with fixed cost)
- Can be called when changing fulfillment method or address

**Response Example:**
```json
{
    "success": true,
    "message": "تم تجهيز بيانات إتمام الطلب بنجاح",
    "data": {
        "cart": {
            "id": 13,
            "branch_id": 1,
            "status": "open",
            "items": [
                {
                    "id": 30,
                    "product": {
                        "id": 1,
                        "title": "برجر كلاسيكي",
                        "slug": "classic-burger",
                        "price": 25,
                        "sale_price": null,
                        "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/burger-classic.jpg",
                        "is_available": true,
                        "type": "FOOD"
                    },
                    "variant": null,
                    "quantity": 1,
                    "unit_price": 25,
                    "subtotal": 25,
                    "addons": null,
                    "addons_price": 0,
                    "total_price": 25,
                    "custom_fields": [],
                    "variant_options": [],
                    "notes": null,
                    "is_available": true,
                    "available_quantity": null
                }
            ],
            "items_count": 4,
            "total_quantity": 7,
            "subtotal": 579,
            "total_addons_price": 0,
            "total_price": 579,
            "created_at": "2026-02-08T21:49:25+00:00",
            "updated_at": "2026-02-09T20:40:39+00:00"
        },
        "cart_valid": true,
        "cart_issues": [],
        "cart_warnings": [],
        "addresses": [
            {
                "id": 1,
                "label": "home",
                "is_default": true,
                "country_id": 1,
                "city_id": 1,
                "district_id": null,
                "recipient_name": null,
                "phone": null,
                "country": "المملكة العربية السعودية",
                "city": "الرياض",
                "district": null,
                "street": "شارع الملك فهد",
                "building_number": "١٢٣",
                "unit_number": "٥",
                "postal_code": "12345",
                "latitude": null,
                "longitude": null,
                "additional_number": null,
                "notes": "بجوار مركز الملك عبدالله المالي"
            }
        ],
        "fulfillment_methods": [
            {
                "value": 1,
                "label": "توصيل للموقع",
                "description": "سيتم توصيل الطلب إلى موقع العميل",
                "requires_address": true,
                "requires_pickup_datetime": false
            },
            {
                "value": 2,
                "label": "استلام من الفرع",
                "description": "العميل سيستلم من الفرع",
                "requires_address": false,
                "requires_pickup_datetime": true
            }
        ],
        "payment_methods": [
            {
                "type": "epayment",
                "name": "الدفع الإلكتروني",
                "description": "الدفع عبر بوابات الدفع الإلكترونية (بطاقة ائتمان، Apple Pay، إلخ)",
                "icon": "credit-card",
                "available": true,
                "epayment_methods": [
                    {
                        "id": 2,
                        "name_ar": "فيزا / ماستركارد",
                        "name_en": "Visa / Mastercard",
                        "code": "vm",
                        "image_url": "https://demo.myfatoorah.com/imgs/payment-methods/vm.png",
                        "service_charge": 0,
                        "total_amount": 579,
                        "currency": "SAR"
                    },
                    {
                        "id": 11,
                        "name_ar": "أبل باي",
                        "name_en": "Apple Pay",
                        "code": "ap",
                        "image_url": "https://demo.myfatoorah.com/imgs/payment-methods/ap.png",
                        "service_charge": 0,
                        "total_amount": 579,
                        "currency": "SAR"
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
        ],
        "wallet": {
            "balance": 310,
            "is_active": true
        },
        "summary": {
            "items_subtotal": 579,
            "shipping_fee": 25,
            "cod_fee": 0,
            "tax_amount": 75.52,
            "total": 604
        },
        "settings": {
            "min_order_amount": 0,
            "free_delivery_threshold": 0,
            "allow_order_notes": true,
            "allow_scheduled_orders": false
        },
        "shipping_options": [
            {
                "value": 1,
                "label": "Express",
                "description": "Express shipping",
                "fee": 50
            },
            {
                "value": 2,
                "label": "Regular",
                "description": "Regular shipping",
                "fee": 25
            }
        ]
    }
}
```

---

### 2. List Orders
**GET** `{{base_url}}/store/orders`

**Headers:**
- `X-Store-Key`: `{{store_key}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)

**Description:** Get customer orders (paginated).

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
            "items_subtotal": 250.00,
            "items_discount": 25.00,
            "items_total": 225.00,
            "shipping_fee": 15.00,
            "cod_fee": 5.00,
            "subtotal": 240.00,
            "total": 245.00,
            "wallet_deduction": 0.00,
            "customer_pickup_datetime": null,
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

---

### 3. Order Details
**GET** `{{base_url}}/store/orders/{id}`

**Headers:**
- `X-Store-Key`: `{{store_key}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**URL Parameters:**
- `id` (required): Order ID

**Description:** Get order details.

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
        "items_subtotal": 250.00,
        "items_discount": 25.00,
        "items_total": 225.00,
        "items_tax": 33.75,
        "shipping_fee": 15.00,
        "cod_fee": 5.00,
        "subtotal": 240.00,
        "total": 245.00,
        "wallet_deduction": 50.00,
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
                "unit_price": 25.00,
                "sale_unit_price": 20.00,
                "total_price": 40.00,
                "total_discount": 10.00,
                "tax_rate": 15.0,
                "total_tax": 6.00,
                "addons": [
                    {
                        "id": 1,
                        "name": "كريمة",
                        "price": 3.00
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

---

### 4. Create Order (Checkout)
**POST** `{{base_url}}/store/orders`

**Headers:**
- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Content-Type`: `application/json`
- `Accept`: `application/json`

**Single endpoint for creating orders with 3 payment methods:**

#### A. Electronic Payment (`epayment`)
**Request Body:**
```json
{
    "fulfillment_method": 1,
    "address_id": 1,
    "payment_method": "epayment",
    "epayment_method_id": 2,
    "notes": "الرجاء الاتصال قبل التوصيل",
    "success_url": "http://store-api.libro-shop.com/payment/result?status=success",
    "error_url": "http://store-api.libro-shop.com/payment/result?status=failed"
}
```

**Required Fields for Epayment:**
- `epayment_method_id`: From Checkout Init → epayment_methods
- `success_url`: URL to redirect after successful payment
- `error_url`: URL to redirect after failed payment

**Response Example (Epayment):**
```json
{
    "success": true,
    "message": "يرجى إكمال الدفع",
    "data": {
        "redirect_url": "https://demo.myfatoorah.com/pay/abc123",
        "attempt_id": 1
    }
}
```
**Notes:** Order is created only after successful payment. After payment: 
- Success → `success_url?order_id=X&attempt_id=Y`
- Failure → `error_url?attempt_id=Y`

#### B. Cash on Delivery (`cod`)
**Request Body:**
```json
{
    "fulfillment_method": 1,
    "address_id": 1,
    "payment_method": "cod",
    "notes": "الرجاء الاتصال قبل التوصيل"
}
```

**Response Example (COD):**
```json
{
    "success": true,
    "message": "تم إنشاء الطلب بنجاح",
    "data": {
        "id": 1,
        "status": "waiting_approval",
        "payment_method": "cod"
    }
}
```
**Notes:** Creates order immediately with **WAITING_APPROVAL** status.

#### C. Wallet Payment (`wallet`)
**Request Body:**
```json
{
    "fulfillment_method": 2,
    "payment_method": "wallet",
    "customer_pickup_datetime": "2025-03-01 14:00:00"
}
```

**Response Example (Wallet):**
```json
{
    "success": true,
    "message": "تم إنشاء الطلب بنجاح",
    "data": {
        "id": 2,
        "status": "paid",
        "payment_method": "wallet"
    }
}
```
**Notes:** Deducts amount and creates order immediately with **PAID** status. Returns error if insufficient balance.

**Common Fields:**
- `fulfillment_method`: 1=delivery, 2=pickup, 3=curbside, 4=dine-in
- `address_id`: Required if `fulfillment_method = 1`
- `customer_pickup_datetime`: Required if `fulfillment_method = 2 or 3`
- `notes`: Optional

---

### 5. Cancel Order
**POST** `{{base_url}}/store/orders/{id}/cancel`

**Headers:**
- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**URL Parameters:**
- `id` (required): Order ID

**Description:** Cancel order if in cancelable state.

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

### 6. Payment Status
**GET** `{{base_url}}/store/orders/payment-status/{attemptId}`

**Headers:**
- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**URL Parameters:**
- `attemptId` (required): Payment attempt ID (returned from Create Order when choosing card)

**Description:** Check electronic payment status after customer returns from payment gateway.

**Response Data:**
- `attempt_id`: Attempt ID
- `status`: Payment status (1=initiated, 2=pending, 3=failed, 4=paid, 5=cancelled, 6=expired)
- `status_label`: Status description
- `order_id`: Order ID (only appears if payment successful)

**Response Example:**
```json
{
    "success": true,
    "message": "تم جلب حالة الدفع بنجاح",
    "data": {
        "attempt_id": 1,
        "status": 4,
        "status_label": "مدفوع",
        "order_id": 123,
        "amount": 604.00,
        "currency": "SAR",
        "payment_date": "2024-01-15T10:32:00Z"
    }
}
```

**Payment Status Codes:**
- `1`: Initiated - Payment started
- `2`: Pending - Payment processing
- `3`: Failed - Payment failed
- `4`: Paid - Payment successful
- `5`: Cancelled - Payment cancelled by user
- `6`: Expired - Payment expired

---

## 💰 Wallet Endpoints

### 1. Get Wallet Balance
**GET** `{{base_url}}/store/wallet`

**Headers:**
- `X-Store-Key`: `{{store_key}}`
- `X-Branch-Id`: `{{branch_id}}`
- `Authorization`: `Bearer {{customer_token}}`
- `Accept`: `application/json`

**Description:** Get customer wallet balance.

**Response Example:**
```json
{
    "success": true,
    "message": "تم جلب رصيد المحفظة بنجاح",
    "data": {
        "balance": 150.00,
        "pending_balance": 0.00,
        "is_active": true
    }
}
```

**Field Descriptions:**
- `balance`: Available balance for immediate use
- `pending_balance`: Balance pending from recent transactions
- `is_active`: Whether wallet is active/enabled

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

### Insufficient Balance (Wallet)
```json
{
    "success": false,
    "message": "رصيد المحفظة غير كافي",
    "errors": {
        "balance": ["الرصيد المتاح: 150.00، المطلوب: 200.00"]
    }
}
```

---

## 📋 Important Notes

1. **Authentication**: Customer endpoints require `Authorization: Bearer {{customer_token}}` header
2. **Branch Context**: Some operations require `X-Branch-Id` header for branch-specific pricing and inventory
3. **Payment Flow**: 
   - Epayment: Redirect to gateway → Verify status → Create order
   - COD: Create order immediately with WAITING_APPROVAL status
   - Wallet: Deduct balance → Create order immediately with PAID status
4. **Currency**: All amounts are in SAR (Saudi Riyal)
5. **Time Format**: All datetime fields are in ISO 8601 format (UTC)
6. **Pagination**: Lists are paginated with `data` array and `meta` information
7. **Cart Validation**: Always call checkout/init first to validate cart before creating order
8. **Order Statuses**: Understand which statuses are cancelable before attempting cancellation