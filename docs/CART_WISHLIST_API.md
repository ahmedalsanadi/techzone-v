# Libero Store API - Cart & Wishlist Documentation

## 🛒 Cart Endpoints (7 Endpoints)
Shopping cart management endpoints. Supports product variants, addons, custom fields, and guest cart merging.

**Cart System Overview:**

- **Single Cart**: Each customer has ONE cart that automatically switches branches
    
- **Branch Context**: Pass branch via `X-Branch-Id` header (not body parameter)
    
- **Auto-Switching**: Cart's branch_id updates automatically when customer switches branches
    
- **Smart Matching**: Same product with different addons/custom_fields = separate items
    
- **Read vs Write**: GET /cart is read-only, POST /cart/items creates cart
    
- **No Data Loss**: Items preserved when switching branches, validated at checkout

### 1. GET Cart - `GET /store/cart`
**Description:** Retrieve the customer's cart with all items and totals.
Retrieve the customer's cart with all items and totals.

**Headers:**

- `X-Branch-Id` (integer, **required**): Current branch ID
    

**Behavior:**

- **Read-only**: Does NOT create a cart if it doesn't exist
    
- **Auto-updates branch**: If cart exists with different branch_id, it will be updated to the current branch
    
- **Single cart**: Each customer has ONE cart that automatically switches branches
    
- Returns empty cart structure if no cart exists
    

**Response:**

- Cart object with items array
    
- If no cart exists: `{ id: null, branch_id: 1, items: [], items_count: 0 }`

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `X-Branch-Id`: Current branch ID (integer, **required**)
- `Authorization`: Bearer token
- `Accept`: application/json (required)

**Behavior:**
- **Read-only**: Does NOT create a cart if it doesn't exist
- **Auto-updates branch**: If cart exists with different branch_id, it will be updated to the current branch
- **Single cart**: Each customer has ONE cart that automatically switches branches
- Returns empty cart structure if no cart exists

**Response:**
```json
{
    "success": true,
    "message": "تم جلب السلة بنجاح",
    "data": {
        "id": 1,
        "branch_id": 1,
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

**Note:** If no cart exists: `{ id: null, branch_id: 1, items: [], items_count: 0 }`

---

### 2. Add Item to Cart - `POST /store/cart/items`
**Description:** Add a product to cart. Creates cart if it doesn't exist.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `X-Branch-Id`: Branch ID where cart belongs (integer, **required**)
- `Content-Type`: application/json (required)
- `Accept`: application/json (required)
- `Authorization`: Bearer token

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

**Body Parameters:**
- `product_id` (integer, required)
- `product_variant_id` (integer, optional)
- `quantity` (integer, required)
- `addons` (array, optional)
  - `addon_item_id` (integer, required)
  - `quantity` (integer, required)
- `custom_fields` (object, optional)
- `variant_options` (object, optional)
- `notes` (string, optional)

**Smart Matching Behavior:**
- Same product + same variant + same addons + same custom_fields = **Merges** (increases quantity)
- Different addons or custom_fields = **Separate cart items**
- Order of addons doesn't matter for matching

**Examples:**
- Pizza + cheese → Add again → Quantity increases ✅
- Pizza + cheese → Pizza + olives → Two separate items ✅
- T-shirt (no addons) → Add again → Quantity increases ✅

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

**Note:** This is the ONLY endpoint that creates a cart. Each customer has ONE cart that auto-switches branches.

---

### 3. Update Cart Item - `PATCH /store/cart/items/{id}`
**Description:** Update cart item quantity, addons, or notes.

**URL Parameters:**
- `id`: Cart item ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Content-Type`: application/json (required)
- `Accept`: application/json (required)
- `Authorization`: Bearer token

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

**Body Parameters:**
- `quantity` (integer, required)
- `addons` (array, optional)
  - `addon_item_id` (integer, required)
  - `quantity` (integer, required)
- `custom_fields` (object, optional)
- `notes` (string, optional)

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

**Note:** branch_id is NOT required - item ID is unique and identifies the cart.

---

### 4. Remove Item from Cart - `DELETE /store/cart/items/{id}`
**Description:** Remove a specific item from cart.

**URL Parameters:**
- `id`: Cart item ID (required)

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Accept`: application/json (required)
- `Authorization`: Bearer token (optional for guests)

**Response:**
```json
{
    "success": true,
    "message": "تم حذف المنتج من السلة بنجاح",
    "data": null
}
```

**Note:** branch_id is NOT required - item ID is unique and identifies the cart.

---

### 5. Clear Cart - `DELETE /store/cart`
**Description:** Remove all items from cart.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Accept`: application/json (required)
- `Authorization`: Bearer token (optional for guests)

**Behavior:**
- Removes all items from the customer's cart
- Cart remains with same branch_id (only items are cleared)
- Branch ID is NOT required (customer has only one cart)

**Response:**
```json
{
    "success": true,
    "message": "تم تفريغ السلة بنجاح",
    "data": null
}
```

**Note:** Since each customer has ONE cart, this clears all items regardless of which branch they were added from.

---

### 6. Merge Guest Cart - `POST /store/cart/merge`
**Description:** Merge guest cart with customer cart after login.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `X-Branch-Id`: Branch ID for the cart (integer, **required**)
- `Authorization`: Bearer token (required for authenticated users)
- `Content-Type`: application/json (required)
- `Accept`: application/json (required)

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

**Body Parameters:**
- `guest_cart` (array, required): Array of cart items
  - `product_id` (integer, required)
  - `product_variant_id` (integer, optional)
  - `quantity` (integer, required)
  - `addons` (array, optional)
  - `custom_fields` (object, optional)
  - `variant_options` (object, optional)
  - `notes` (string, optional)

**Smart Merging Behavior:**
- Items with matching product + variant + addons + custom_fields → **Quantities merged**
- Items with different addons/custom_fields → **Added as separate items**
- Creates cart if customer doesn't have one
- Updates cart branch_id to specified branch

**Use Case:** Called after customer login to merge their guest session cart with their account cart.

**Response:**
```json
{
    "success": true,
    "message": "تم دمج السلة بنجاح",
    "data": {
        "id": 1,
        "branch_id": 1,
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
**Description:** Validate cart before checkout. Checks product availability, stock levels, and prices in the current branch.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `X-Branch-Id`: Branch ID to validate cart for (integer, **required**)
- `Authorization`: Bearer token (optional)
- `Accept`: application/json (required)

**Validation Checks:**
- Product availability in current branch
- Sufficient stock in current branch
- Price changes (returns warnings)
- Product status (active/inactive)

**Response:**
```json
{
    "success": true,
    "message": "السلة صالحة",
    "data": {
        "is_valid": true,
        "issues": [],
        "warnings": [],
        "cart": {
            "id": 1,
            "branch_id": 1,
            "status": "open",
            "items": [...],
            "items_count": 2,
            "subtotal": 50,
            "total_addons_price": 0,
            "total_price": 50
        }
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
        "warnings": [
            {
                "item_id": 2,
                "product_id": 2,
                "product_name": "دبل تشيز برجر",
                "issue": "price_changed",
                "message": "سعر المنتج تغير من 35 إلى 42",
                "old_price": 35,
                "new_price": 42
            }
        ],
        "cart": {
            "id": 1,
            "branch_id": 1,
            "status": "open",
            "items": [...],
            "items_count": 2,
            "subtotal": 92,
            "total_addons_price": 0,
            "total_price": 92
        }
    }
}
```

**Important:** Since customers can switch branches, items added in one branch may not be available in another. This endpoint validates against the CURRENT branch (X-Branch-Id).

---

## 💝 Wishlist Endpoints (7 Endpoints)

### 1. GET Wishlist - `GET /store/wishlist`
**Description:** Get all products in customer's wishlist.

**Headers:**
- `X-Store-Key`: Tenant identifier (required)
- `Authorization`: Bearer token (required)
- `Accept`: application/json (required)

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
- `Content-Type`: application/json (required)
- `Accept`: application/json (required)

**Request Body:**
```json
{
  "product_id": 1
}
```

**Body Parameters:**
- `product_id` (integer, required)

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
- `Accept`: application/json (required)

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
- `Accept`: application/json (required)

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
- `Content-Type`: application/json (required)
- `Accept`: application/json (required)

**Request Body (optional):**
```json
{
  "quantity": 1,
  "product_variant_id": null
}
```

**Body Parameters:**
- `quantity` (integer, optional)
- `product_variant_id` (integer, optional)

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
- `Accept`: application/json (required)

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
- `Accept`: application/json (required)

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
| `X-Branch-Id` | Current branch ID | For cart endpoints** | `1` |
| `Accept-Language` | Language preference | No | `ar` or `en` |
| `Content-Type` | Request content type | For POST/PATCH/PUT | `application/json` |
| `Accept` | Response format | Yes | `application/json` |

***Note on Authentication:***
- **Cart endpoints:** Most work for guests (except merge requires auth)
- **Wishlist endpoints:** All require authentication

****Note on X-Branch-Id:***
- **Required for:** GET /cart, POST /cart/items, POST /cart/merge, POST /cart/validate
- **Not required for:** PATCH/DELETE /cart/items, DELETE /cart (item/cart ID is sufficient)

---

## 🔧 Cart System Overview

**Key Concepts:**
- **Single Cart**: Each customer has ONE cart that automatically switches branches
- **Branch Context**: Pass branch via `X-Branch-Id` header (not body parameter)
- **Auto-Switching**: Cart's branch_id updates automatically when customer switches branches
- **Smart Matching**: Same product with different addons/custom_fields = separate items
- **Read vs Write**: GET /cart is read-only, POST /cart/items creates cart
- **No Data Loss**: Items preserved when switching branches, validated at checkout

**Branch Switching Example:**
1. Customer adds items in Branch A (branch_id=1)
2. Customer switches to Branch B (branch_id=2)
3. GET /cart with X-Branch-Id=2 → cart.branch_id updates to 2, items remain
4. POST /cart/validate checks availability in Branch B
5. Some items may fail validation if not available in Branch B

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
- `branch_required`: X-Branch-Id header missing

---

## 📊 Rate Limiting

- **Guest endpoints:** 60 requests/minute
- **Authenticated endpoints:** 60 requests/minute
- **Authentication endpoints:** 10 requests/minute

---

## 🎯 Key Changes from Previous Version

1. **Branch Support**: All cart endpoints now require `X-Branch-Id` header
2. **Single Cart System**: Each customer has one cart that switches branches
3. **Enhanced Validation**: Returns price change warnings and full cart data
4. **Improved Responses**: More detailed meta information in responses
5. **Smart Matching**: Better handling of addons and custom fields

---

*Last Updated: January 2026*