# Libero Store API - Cart & Wishlist Documentation

## 🛒 Cart Endpoints (7 Endpoints)

### 1. GET Cart - `GET /store/cart`
**Description:** Retrieve the customer's active cart with all items and totals.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (optional for guests)
- `Accept-Language`: ar or en

**Response:**
```json
{
    "success": true,
    "message": "تم جلب السلة بنجاح",
    "data": {
        "id": 1,
        "status": "open",
        "items": [
            {
                "id": 1,
                "product": {
                    "id": 1,
                    "title": "برجر كلاسيكي",
                    "slug": "classic-burger",
                    "price": 25,
                    "sale_price": null,
                    "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
                    "is_available": true,
                    "type": "FOOD"
                },
                "variant": null,
                "quantity": 2,
                "unit_price": 25,
                "subtotal": 50,
                "addons": [
                    {
                        "addon_item_id": 10,
                        "addon_group_name": null,
                        "addon_item_name": "حليب كامل الدسم",
                        "quantity": 1,
                        "price": 0,
                        "multiply_by_quantity": false
                    }
                ],
                "addons_price": 0,
                "total_price": 50,
                "custom_fields": {
                    "engraving_text": "محمد"
                },
                "variant_options": {
                    "size": "Large",
                    "color": "Red"
                },
                "notes": "Please wrap carefully",
                "is_available": true,
                "available_quantity": null
            }
        ],
        "items_count": 2,
        "subtotal": 50,
        "total_addons_price": 0,
        "total_price": 50,
        "created_at": "2026-01-20T21:16:52+00:00",
        "updated_at": "2026-01-20T21:16:52+00:00"
    }
}
```

---

### 2. Add Item to Cart - `POST /store/cart/items`
**Description:** Add a product to cart. If item exists with same variant, quantity will be increased.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Content-Type`: application/json
- `Accept`: application/json

**Request Body:**
```json
{
  "product_id": 1,
  "product_variant_id": null,
  "quantity": 2,
  "addons": [
    {
      "addon_item_id": 10,
      "quantity": 1
    }
  ],
  "custom_fields": {
    "engraving_text": "محمد"
  },
  "variant_options": {
    "size": "Large",
    "color": "Red"
  },
  "notes": "Please wrap carefully"
}
```

**Response:**
```json
{
    "success": true,
    "message": "تم تحديث الكمية في السلة (4)",
    "data": {
        "id": 1,
        "product": {
            "id": 1,
            "title": "برجر كلاسيكي",
            "slug": "classic-burger",
            "price": 25,
            "sale_price": null,
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
            "is_available": true,
            "type": "FOOD"
        },
        "variant": null,
        "quantity": 4,
        "unit_price": 25,
        "subtotal": 100,
        "addons": [
            {
                "addon_item_id": 10,
                "addon_group_name": null,
                "addon_item_name": "حليب كامل الدسم",
                "quantity": 1,
                "price": 0,
                "multiply_by_quantity": false
            }
        ],
        "addons_price": 0,
        "total_price": 100,
        "custom_fields": {
            "engraving_text": "محمد"
        },
        "variant_options": {
            "size": "Large",
            "color": "Red"
        },
        "notes": "Please wrap carefully",
        "is_available": true,
        "available_quantity": null
    },
    "meta": {
        "action": "quantity_updated",
        "previous_quantity": 2,
        "added_quantity": 2,
        "new_quantity": 4
    }
}
```

---

### 3. Update Cart Item - `PATCH /store/cart/items/{id}`
**Description:** Update cart item quantity, addons, or notes.

**URL Parameters:**
- `id`: Cart item ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Content-Type`: application/json
- `Accept`: application/json

**Request Body:**
```json
{
  "quantity": 3,
  "addons": [
    {
      "addon_item_id": 10,
      "quantity": 2
    }
  ],
  "custom_fields": {
    "engraving_text": "Updated text"
  },
  "notes": "Updated notes"
}
```

**Response:**
```json
{
    "success": true,
    "message": "تم تحديث المنتج في السلة بنجاح",
    "data": {
        "id": 1,
        "product": {
            "id": 1,
            "title": "برجر كلاسيكي",
            "slug": "classic-burger",
            "price": 25,
            "sale_price": null,
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
            "is_available": true,
            "type": "FOOD"
        },
        "variant": null,
        "quantity": 3,
        "unit_price": 25,
        "subtotal": 75,
        "addons": [
            {
                "addon_item_id": 10,
                "addon_group_name": null,
                "addon_item_name": "حليب كامل الدسم",
                "quantity": 2,
                "price": 0,
                "multiply_by_quantity": false
            }
        ],
        "addons_price": 0,
        "total_price": 75,
        "custom_fields": {
            "engraving_text": "Updated text"
        },
        "variant_options": {
            "size": "Large",
            "color": "Red"
        },
        "notes": "Updated notes",
        "is_available": true,
        "available_quantity": null
    }
}
```

---

### 4. Remove Item from Cart - `DELETE /store/cart/items/{id}`
**Description:** Remove a specific item from cart.

**URL Parameters:**
- `id`: Cart item ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Accept`: application/json

**Response:**
```json
{
    "success": true,
    "message": "تم حذف المنتج من السلة بنجاح",
    "data": null
}
```

---

### 5. Clear Cart - `DELETE /store/cart`
**Description:** Remove all items from cart.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Accept`: application/json

**Response:**
```json
{
    "success": true,
    "message": "تم تفريغ السلة بنجاح",
    "data": null
}
```

---

### 6. Merge Guest Cart - `POST /store/cart/merge`
**Description:** Merge guest cart with customer cart after login. Duplicate items will have quantities increased.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required for authenticated users)
- `Content-Type`: application/json
- `Accept`: application/json

**Request Body:**
```json
{
  "guest_cart": [
    {
      "product_id": 1,
      "product_variant_id": null,
      "quantity": 2,
      "addons": [],
      "custom_fields": {},
      "notes": "Guest item 1"
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
    "success": true,
    "message": "تم دمج السلة بنجاح",
    "data": {
        "id": 1,
        "status": "open",
        "items": [
            {
                "id": 2,
                "product": {
                    "id": 1,
                    "title": "برجر كلاسيكي",
                    "slug": "classic-burger",
                    "price": 25,
                    "sale_price": null,
                    "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
                    "is_available": true,
                    "type": "FOOD"
                },
                "variant": null,
                "quantity": 2,
                "unit_price": 25,
                "subtotal": 50,
                "addons": null,
                "addons_price": 0,
                "total_price": 50,
                "custom_fields": [],
                "variant_options": null,
                "notes": "Guest item 1",
                "is_available": true,
                "available_quantity": null
            },
            {
                "id": 3,
                "product": {
                    "id": 2,
                    "title": "دبل تشيز برجر",
                    "slug": "double-cheese-burger",
                    "price": 42,
                    "sale_price": 35,
                    "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-double.jpg",
                    "is_available": true,
                    "type": "FOOD"
                },
                "variant": null,
                "quantity": 1,
                "unit_price": 35,
                "subtotal": 35,
                "addons": null,
                "addons_price": 0,
                "total_price": 35,
                "custom_fields": null,
                "variant_options": null,
                "notes": null,
                "is_available": true,
                "available_quantity": null
            }
        ],
        "items_count": 3,
        "subtotal": 85,
        "total_addons_price": 0,
        "total_price": 85,
        "created_at": "2026-01-20T21:16:52+00:00",
        "updated_at": "2026-01-20T21:16:52+00:00"
    }
}
```

---

### 7. Validate Cart - `POST /store/cart/validate`
**Description:** Validate cart before checkout. Checks product availability and stock levels.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (optional)
- `Accept`: application/json

**Response:**
```json
{
    "success": true,
    "message": "السلة صالحة",
    "data": {
        "is_valid": true,
        "issues": [],
        "warnings": []
    }
}
```

**Error Response (when validation fails):**
```json
{
    "success": false,
    "message": "المنتج غير متوفر حالياً",
    "data": {
        "is_valid": false,
        "issues": [
            {
                "item_id": 1,
                "product_id": 1,
                "product_name": "برجر كلاسيكي",
                "issue": "out_of_stock",
                "message": "الكمية المطلوبة تتجاوز المخزون المتاح"
            }
        ],
        "warnings": []
    }
}
```

---

## 💝 Wishlist Endpoints (7 Endpoints)

### 1. GET Wishlist - `GET /store/wishlist`
**Description:** Get all products in customer's wishlist.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Accept`: application/json

**Response:**
```json
{
    "success": true,
    "message": "تم جلب قائمة الرغبات بنجاح",
    "data": [
        {
            "id": 1,
            "product": {
                "id": 1,
                "title": "برجر كلاسيكي",
                "slug": "classic-burger",
                "price": 25,
                "sale_price": null,
                "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
                "is_available": true,
                "type": "FOOD"
            },
            "added_at": "2026-01-20T21:16:52+00:00"
        }
    ],
    "meta": {
        "total": 1,
        "count": 1
    }
}
```

---

### 2. Add to Wishlist - `POST /store/wishlist`
**Description:** Add a product to wishlist.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Content-Type`: application/json
- `Accept`: application/json

**Request Body:**
```json
{
  "product_id": 1
}
```

**Response:**
```json
{
    "success": true,
    "message": "تمت الإضافة إلى قائمة الرغبات بنجاح",
    "data": {
        "id": 1,
        "product": {
            "id": 1,
            "title": "برجر كلاسيكي",
            "slug": "classic-burger",
            "price": 25,
            "sale_price": null,
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
            "is_available": true,
            "type": "FOOD"
        },
        "added_at": "2026-01-20T21:16:52+00:00"
    }
}
```

---

### 3. Remove from Wishlist - `DELETE /store/wishlist/{productId}`
**Description:** Remove a product from wishlist.

**URL Parameters:**
- `productId`: Product ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Accept`: application/json

**Response:**
```json
{
    "success": true,
    "message": "تم الحذف من قائمة الرغبات بنجاح",
    "data": null
}
```

---

### 4. Toggle Wishlist - `POST /store/wishlist/{productId}/toggle`
**Description:** Toggle product in wishlist. If exists, removes it. If doesn't exist, adds it.

**URL Parameters:**
- `productId`: Product ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Accept`: application/json

**Response (when adding):**
```json
{
    "success": true,
    "message": "تمت الإضافة إلى قائمة الرغبات بنجاح",
    "data": {
        "action": "added",
        "wishlist_item": {
            "id": 1,
            "product": {
                "id": 1,
                "title": "برجر كلاسيكي",
                "slug": "classic-burger",
                "price": 25,
                "sale_price": null,
                "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
                "is_available": true,
                "type": "FOOD"
            },
            "added_at": "2026-01-20T21:16:52+00:00"
        }
    }
}
```

**Response (when removing):**
```json
{
    "success": true,
    "message": "تم الحذف من قائمة الرغبات بنجاح",
    "data": {
        "action": "removed"
    }
}
```

---

### 5. Move to Cart - `POST /store/wishlist/{productId}/move-to-cart`
**Description:** Move product from wishlist to cart. Product is removed from wishlist and added to cart.

**URL Parameters:**
- `productId`: Product ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Content-Type`: application/json
- `Accept`: application/json

**Request Body (optional):**
```json
{
  "quantity": 1,
  "product_variant_id": null
}
```

**Response:**
```json
{
    "success": true,
    "message": "تم نقل المنتج إلى السلة بنجاح",
    "data": {
        "cart_item": {
            "id": 1,
            "product": {
                "id": 1,
                "title": "برجر كلاسيكي",
                "slug": "classic-burger",
                "price": 25,
                "sale_price": null,
                "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
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
            "custom_fields": null,
            "variant_options": null,
            "notes": null,
            "is_available": true,
            "available_quantity": null
        },
        "wishlist_removed": true
    }
}
```

---

### 6. Clear Wishlist - `DELETE /store/wishlist`
**Description:** Remove all products from wishlist.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Accept`: application/json

**Response:**
```json
{
    "success": true,
    "message": "تم تفريغ قائمة الرغبات بنجاح",
    "data": null
}
```

---

### 7. Check if in Wishlist - `GET /store/wishlist/check/{productId}`
**Description:** Check if a product is in wishlist.

**URL Parameters:**
- `productId`: Product ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Accept`: application/json

**Response:**
```json
{
    "success": true,
    "message": "تم التحقق بنجاح",
    "data": {
        "is_in_wishlist": true,
        "wishlist_item_id": 1,
        "product_id": 1
    }
}
```

**Response (when not in wishlist):**
```json
{
    "success": true,
    "message": "تم التحقق بنجاح",
    "data": {
        "is_in_wishlist": false,
        "wishlist_item_id": null,
        "product_id": 1
    }
}
```

---

## 📋 Common Headers for All Endpoints

| Header | Description | Required | Example |
|--------|-------------|----------|---------|
| `X-Store-Key` | Tenant identifier | Yes | `37858998-3343-4293-98ac-1e28cc0f9e27` |
| `Authorization` | Bearer token | Varies* | `Bearer 1|abc123...` |
| `Accept-Language` | Language preference | No | `ar` or `en` |
| `Content-Type` | Request content type | For POST/PATCH/PUT | `application/json` |
| `Accept` | Response format | Yes | `application/json` |

***Note on Authentication:***
- **Cart endpoints:** Most work for guests (except merge)
- **Wishlist endpoints:** All require authentication

---

## ⚠️ Error Responses

All endpoints return consistent error responses:

```json
{
    "success": false,
    "message": "رسالة الخطأ باللغة المختارة",
    "errors": {
        "field_name": ["رسالة الخطأ"]
    },
    "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `validation_error`: Invalid request data
- `not_found`: Resource not found
- `unauthenticated`: Missing or invalid authentication
- `out_of_stock`: Product out of stock
- `cart_empty`: Cart has no items
- `already_in_wishlist`: Product already in wishlist

---

## 📊 Rate Limiting

- **Guest endpoints:** 60 requests/minute
- **Authenticated endpoints:** 60 requests/minute
- **Authentication endpoints:** 10 requests/minute

---

*Last Updated: January 2024*