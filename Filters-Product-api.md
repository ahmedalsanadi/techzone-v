# Products API Documentation

## Overview

The Products API provides endpoints for managing and retrieving product information with branch-aware filtering capabilities. All endpoints support Arabic/English bilingual responses and include detailed product information such as variants, addons, custom fields, and pricing.

## Base URL

```
{{base_url}}/store/products
```

## Headers

All product endpoints require the following headers:

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `X-Store-Key` | string | Yes | Store identification key |
| `Authorization` | string | Yes | Bearer token for customer authentication |
| `Accept` | string | Yes | `application/json` |
| `X-Branch-Id` | integer | No | Branch ID for branch-specific filtering |

### Branch Context

- **With `X-Branch-Id`**: Returns products available in that specific branch with branch-specific stock levels and pricing
- **Without `X-Branch-Id`**: Returns all products with general information (no branch filtering)

---

## Endpoints

### 1. List Products

Retrieve a paginated list of products with optional filtering.

**Endpoint:** `GET /store/products`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ids` | string | - | Comma-separated product IDs (e.g., `ids=1,2,3`) |
| `search` | string | - | 🔍 Search in product title and description |
| `category_id` | integer | - | Filter by category ID |
| `brand_id` | integer | - | Filter by brand ID |
| `collection_id` | integer | - | Filter by collection ID |
| `type` | integer | - | Product type: `1`=shippable, `2`=digital_license, `3`=digital_files, `4`=service, `6`=food |
| `availability` | string | - | `in_stock`, `out_of_stock`, `low_stock` |
| `is_featured` | boolean | - | ⭐ Filter featured products only |
| `is_latest` | boolean | - | 🆕 Filter latest products only |
| `min_price` | numeric | - | 💰 Minimum price filter |
| `max_price` | numeric | - | 💰 Maximum price filter |
| `min_calories` | integer | - | 🍔 Minimum calories (for restaurants) |
| `max_calories` | integer | - | 🍔 Maximum calories (for restaurants) |
| `min_weight` | numeric | - | 📦 Minimum shipping weight |
| `max_weight` | numeric | - | 📦 Maximum shipping weight |
| `has_variants` | boolean | - | Products with options/variants |
| `has_discount` | boolean | - | 🏷️ Products with active discounts |
| `sort` | string | `display_order` | Sort by: `price`, `title`, `created_at`, `display_order` |
| `order` | string | `asc` | Sort direction: `asc`, `desc` |
| `per_page` | integer | `15` | Items per page |
| `page` | integer | `1` | Page number |

#### Example Requests

```http
# Get all products (paginated)
GET {{base_url}}/store/products?page=1&per_page=15

# Get products for specific branch
GET {{base_url}}/store/products
X-Branch-Id: 1

# Search products
GET {{base_url}}/store/products?search=برجر

# Filter by category and price range
GET {{base_url}}/store/products?category_id=1&min_price=50&max_price=200

# Get featured products sorted by price
GET {{base_url}}/store/products?is_featured=true&sort=price&order=asc

# Combined filters
GET {{base_url}}/store/products?category_id=1&brand_id=2&min_price=50&max_price=500&has_discount=true&sort=price&order=asc&per_page=20
```

#### Success Response (200 OK)

```json
{
    "success": true,
    "message": "تم جلب المنتجات بنجاح",
    "data": [
        {
            "id": 1,
            "title": "برجر كلاسيكي",
            "subtitle": "الطعم الأصلي",
            "promotional_title": "🔥 الأكثر مبيعاً",
            "description": "برجر لحم بقري طازج 150 جرام مع خس وطماطم وبصل ومخلل وصوص خاص",
            "slug": "classic-burger",
            "type": {
                "value": 6,
                "name": "FOOD",
                "label": "Food",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/burger-classic.jpg",
            "image_urls": [
                "https://dashboard.libro-shop.com/storage/tenants/1/products/burger-classic-1.jpg",
                "https://dashboard.libro-shop.com/storage/tenants/1/products/burger-classic-2.jpg"
            ],
            "price": 25,
            "sale_price": null,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": false,
            "sku": null,
            "is_available": true,
            "available_quantity": null,
            "unlimited_quantity": true,
            "max_quantity_per_customer": null,
            "is_featured": true,
            "is_latest": true,
            "is_pinned_home": true,
            "is_variation": false,
            "allow_notes": true,
            "calories": 650,
            "shipping_weight": null,
            "return_period_days": 0,
            "replacement_period_days": 0,
            "brand": null,
            "categories": [
                {
                    "id": 1,
                    "name": "الأطعمة والوجبات",
                    "slug": "food-meals",
                    "image_url": null
                },
                {
                    "id": 6,
                    "name": "وجبات سريعة",
                    "slug": "fast-food",
                    "image_url": null
                }
            ],
            "variants": [],
            "addons": [
                {
                    "id": 1,
                    "name": "الصوصات",
                    "description": "اختر الصوصات المفضلة",
                    "input_type": "boolean",
                    "min_selected": 0,
                    "max_selected": 3,
                    "is_required": false,
                    "items": [
                        {
                            "id": 1,
                            "title": "كاتشب",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 2,
                            "title": "مايونيز",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 3,
                            "title": "صوص باربكيو",
                            "description": null,
                            "extra_price": 2,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 4,
                            "title": "صوص الرانش",
                            "description": null,
                            "extra_price": 2,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 5,
                            "title": "صوص حار",
                            "description": null,
                            "extra_price": 1,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "إضافات إضافية",
                    "description": "أضف المزيد لوجبتك",
                    "input_type": "number",
                    "min_selected": 0,
                    "max_selected": null,
                    "is_required": false,
                    "items": [
                        {
                            "id": 6,
                            "title": "جبنة إضافية",
                            "description": null,
                            "extra_price": 3,
                            "max_quantity": 2,
                            "default_value": 0,
                            "multiply_price_by_quantity": true,
                            "is_required": false
                        },
                        {
                            "id": 7,
                            "title": "لحم إضافي",
                            "description": null,
                            "extra_price": 8,
                            "max_quantity": 2,
                            "default_value": 0,
                            "multiply_price_by_quantity": true,
                            "is_required": false
                        },
                        {
                            "id": 8,
                            "title": "بيض مقلي",
                            "description": null,
                            "extra_price": 4,
                            "max_quantity": 1,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 9,
                            "title": "مخلل",
                            "description": null,
                            "extra_price": 1,
                            "max_quantity": 1,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                }
            ],
            "created_at": "2026-02-10T16:32:43.000000Z"
        },
        {
            "id": 2,
            "title": "دبل تشيز برجر",
            "subtitle": "للجوعانين",
            "promotional_title": null,
            "description": "قطعتين لحم بقري 150 جرام لكل قطعة مع جبنة شيدر مزدوجة",
            "slug": "double-cheese-burger",
            "type": {
                "value": 6,
                "name": "FOOD",
                "label": "Food",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/burger-double.jpg",
            "image_urls": [],
            "price": 42,
            "sale_price": 35,
            "sale_price_end_at": "2026-02-17T16:32:43.000000Z",
            "tax_rate": null,
            "has_discount": true,
            "sku": null,
            "is_available": true,
            "available_quantity": null,
            "unlimited_quantity": true,
            "max_quantity_per_customer": null,
            "is_featured": true,
            "is_latest": false,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": true,
            "calories": 1100,
            "shipping_weight": null,
            "return_period_days": 0,
            "replacement_period_days": 0,
            "brand": null,
            "categories": [
                {
                    "id": 6,
                    "name": "وجبات سريعة",
                    "slug": "fast-food",
                    "image_url": null
                }
            ],
            "variants": [],
            "addons": [
                {
                    "id": 1,
                    "name": "الصوصات",
                    "description": "اختر الصوصات المفضلة",
                    "input_type": "boolean",
                    "min_selected": 0,
                    "max_selected": 3,
                    "is_required": false,
                    "items": [
                        {
                            "id": 1,
                            "title": "كاتشب",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 2,
                            "title": "مايونيز",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 3,
                            "title": "صوص باربكيو",
                            "description": null,
                            "extra_price": 2,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 4,
                            "title": "صوص الرانش",
                            "description": null,
                            "extra_price": 2,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 5,
                            "title": "صوص حار",
                            "description": null,
                            "extra_price": 1,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "إضافات إضافية",
                    "description": "أضف المزيد لوجبتك",
                    "input_type": "number",
                    "min_selected": 0,
                    "max_selected": null,
                    "is_required": false,
                    "items": [
                        {
                            "id": 6,
                            "title": "جبنة إضافية",
                            "description": null,
                            "extra_price": 3,
                            "max_quantity": 2,
                            "default_value": 0,
                            "multiply_price_by_quantity": true,
                            "is_required": false
                        },
                        {
                            "id": 7,
                            "title": "لحم إضافي",
                            "description": null,
                            "extra_price": 8,
                            "max_quantity": 2,
                            "default_value": 0,
                            "multiply_price_by_quantity": true,
                            "is_required": false
                        },
                        {
                            "id": 8,
                            "title": "بيض مقلي",
                            "description": null,
                            "extra_price": 4,
                            "max_quantity": 1,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 9,
                            "title": "مخلل",
                            "description": null,
                            "extra_price": 1,
                            "max_quantity": 1,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                }
            ],
            "created_at": "2026-02-10T16:32:43.000000Z"
        },
        {
            "id": 3,
            "title": "برجر دجاج مقرمش",
            "subtitle": null,
            "promotional_title": null,
            "description": "صدر دجاج مقرمش مع صوص خاص وخس",
            "slug": "crispy-chicken-burger",
            "type": {
                "value": 6,
                "name": "FOOD",
                "label": "Food",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/burger-chicken.jpg",
            "image_urls": [],
            "price": 22,
            "sale_price": null,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": false,
            "sku": null,
            "is_available": true,
            "available_quantity": null,
            "unlimited_quantity": true,
            "max_quantity_per_customer": null,
            "is_featured": false,
            "is_latest": true,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": true,
            "calories": 550,
            "shipping_weight": null,
            "return_period_days": 0,
            "replacement_period_days": 0,
            "brand": null,
            "categories": [
                {
                    "id": 6,
                    "name": "وجبات سريعة",
                    "slug": "fast-food",
                    "image_url": null
                }
            ],
            "variants": [],
            "addons": [
                {
                    "id": 1,
                    "name": "الصوصات",
                    "description": "اختر الصوصات المفضلة",
                    "input_type": "boolean",
                    "min_selected": 0,
                    "max_selected": 3,
                    "is_required": false,
                    "items": [
                        {
                            "id": 1,
                            "title": "كاتشب",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 2,
                            "title": "مايونيز",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 3,
                            "title": "صوص باربكيو",
                            "description": null,
                            "extra_price": 2,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 4,
                            "title": "صوص الرانش",
                            "description": null,
                            "extra_price": 2,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 5,
                            "title": "صوص حار",
                            "description": null,
                            "extra_price": 1,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "إضافات إضافية",
                    "description": "أضف المزيد لوجبتك",
                    "input_type": "number",
                    "min_selected": 0,
                    "max_selected": null,
                    "is_required": false,
                    "items": [
                        {
                            "id": 6,
                            "title": "جبنة إضافية",
                            "description": null,
                            "extra_price": 3,
                            "max_quantity": 2,
                            "default_value": 0,
                            "multiply_price_by_quantity": true,
                            "is_required": false
                        },
                        {
                            "id": 7,
                            "title": "لحم إضافي",
                            "description": null,
                            "extra_price": 8,
                            "max_quantity": 2,
                            "default_value": 0,
                            "multiply_price_by_quantity": true,
                            "is_required": false
                        },
                        {
                            "id": 8,
                            "title": "بيض مقلي",
                            "description": null,
                            "extra_price": 4,
                            "max_quantity": 1,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 9,
                            "title": "مخلل",
                            "description": null,
                            "extra_price": 1,
                            "max_quantity": 1,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                }
            ],
            "created_at": "2026-02-10T16:32:43.000000Z"
        },
        {
            "id": 4,
            "title": "لاتيه",
            "subtitle": "قهوة إيطالية",
            "promotional_title": null,
            "description": "إسبريسو مع حليب مبخر ورغوة ناعمة",
            "slug": "latte",
            "type": {
                "value": 6,
                "name": "FOOD",
                "label": "Food",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/latte.jpg",
            "image_urls": [],
            "price": 18,
            "sale_price": null,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": false,
            "sku": null,
            "is_available": true,
            "available_quantity": null,
            "unlimited_quantity": true,
            "max_quantity_per_customer": null,
            "is_featured": true,
            "is_latest": false,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": false,
            "calories": 150,
            "shipping_weight": null,
            "return_period_days": 0,
            "replacement_period_days": 0,
            "brand": null,
            "categories": [
                {
                    "id": 1,
                    "name": "الأطعمة والوجبات",
                    "slug": "food-meals",
                    "image_url": null
                }
            ],
            "variants": [],
            "addons": [
                {
                    "id": 3,
                    "name": "نوع الحليب",
                    "description": "اختر نوع الحليب",
                    "input_type": "boolean",
                    "min_selected": 1,
                    "max_selected": 1,
                    "is_required": true,
                    "items": [
                        {
                            "id": 10,
                            "title": "حليب كامل الدسم",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 11,
                            "title": "حليب قليل الدسم",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 12,
                            "title": "حليب اللوز",
                            "description": null,
                            "extra_price": 3,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 13,
                            "title": "حليب الشوفان",
                            "description": null,
                            "extra_price": 4,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                },
                {
                    "id": 4,
                    "name": "درجة الحلاوة",
                    "description": "اختر درجة الحلاوة",
                    "input_type": "boolean",
                    "min_selected": 0,
                    "max_selected": 1,
                    "is_required": false,
                    "items": [
                        {
                            "id": 14,
                            "title": "بدون سكر",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 15,
                            "title": "قليل السكر",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 16,
                            "title": "سكر عادي",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 17,
                            "title": "سكر زيادة",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                }
            ],
            "created_at": "2026-02-10T16:32:43.000000Z"
        },
        {
            "id": 5,
            "title": "كابتشينو",
            "subtitle": null,
            "promotional_title": null,
            "description": "إسبريسو مع حليب مبخر ورغوة كثيفة",
            "slug": "cappuccino",
            "type": {
                "value": 6,
                "name": "FOOD",
                "label": "Food",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/cappuccino.jpg",
            "image_urls": [],
            "price": 16,
            "sale_price": null,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": false,
            "sku": null,
            "is_available": true,
            "available_quantity": null,
            "unlimited_quantity": true,
            "max_quantity_per_customer": null,
            "is_featured": false,
            "is_latest": true,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": false,
            "calories": 120,
            "shipping_weight": null,
            "return_period_days": 0,
            "replacement_period_days": 0,
            "brand": null,
            "categories": [
                {
                    "id": 1,
                    "name": "الأطعمة والوجبات",
                    "slug": "food-meals",
                    "image_url": null
                }
            ],
            "variants": [],
            "addons": [
                {
                    "id": 3,
                    "name": "نوع الحليب",
                    "description": "اختر نوع الحليب",
                    "input_type": "boolean",
                    "min_selected": 1,
                    "max_selected": 1,
                    "is_required": true,
                    "items": [
                        {
                            "id": 10,
                            "title": "حليب كامل الدسم",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 11,
                            "title": "حليب قليل الدسم",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 12,
                            "title": "حليب اللوز",
                            "description": null,
                            "extra_price": 3,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 13,
                            "title": "حليب الشوفان",
                            "description": null,
                            "extra_price": 4,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                },
                {
                    "id": 4,
                    "name": "درجة الحلاوة",
                    "description": "اختر درجة الحلاوة",
                    "input_type": "boolean",
                    "min_selected": 0,
                    "max_selected": 1,
                    "is_required": false,
                    "items": [
                        {
                            "id": 14,
                            "title": "بدون سكر",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 15,
                            "title": "قليل السكر",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 16,
                            "title": "سكر عادي",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        },
                        {
                            "id": 17,
                            "title": "سكر زيادة",
                            "description": null,
                            "extra_price": 0,
                            "max_quantity": null,
                            "default_value": 0,
                            "multiply_price_by_quantity": false,
                            "is_required": false
                        }
                    ]
                }
            ],
            "created_at": "2026-02-10T16:32:43.000000Z"
        },
        {
            "id": 6,
            "title": "تيشيرت قطني",
            "subtitle": "قطن 100%",
            "promotional_title": null,
            "description": "تيشيرت قطني عالي الجودة مريح للارتداء اليومي",
            "slug": "cotton-tshirt",
            "type": {
                "value": 1,
                "name": "SHIPPABLE",
                "label": "Shippable Product",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/tshirt.jpg",
            "image_urls": [
                "https://dashboard.libro-shop.com/storage/tenants/1/products/tshirt-white.jpg",
                "https://dashboard.libro-shop.com/storage/tenants/1/products/tshirt-black.jpg",
                "https://dashboard.libro-shop.com/storage/tenants/1/products/tshirt-blue.jpg"
            ],
            "price": 79,
            "sale_price": 59,
            "sale_price_end_at": "2026-02-24T16:32:43.000000Z",
            "tax_rate": null,
            "has_discount": true,
            "sku": "TSH-COTTON-001",
            "is_available": true,
            "available_quantity": 94,
            "unlimited_quantity": false,
            "max_quantity_per_customer": 5,
            "is_featured": true,
            "is_latest": true,
            "is_pinned_home": false,
            "is_variation": true,
            "allow_notes": false,
            "calories": null,
            "shipping_weight": 0.25,
            "return_period_days": 14,
            "replacement_period_days": 7,
            "brand": {
                "id": 4,
                "name": "Nike",
                "slug": "nike",
                "image_url": "https://dashboard.libro-shop.com/storage/tenants/1/brands/nike.png"
            },
            "categories": [
                {
                    "id": 4,
                    "name": "ملابس",
                    "slug": "clothes",
                    "image_url": null
                }
            ],
            "variants": [
                {
                    "id": 8,
                    "title": "L - أسود",
                    "sku": "TSH-L-BLK",
                    "option_values": {
                        "size": "L",
                        "color": "أسود"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 20,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 9,
                    "title": "L - أزرق",
                    "sku": "TSH-L-BLU",
                    "option_values": {
                        "size": "L",
                        "color": "أزرق"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 19,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 10,
                    "title": "XL - أبيض",
                    "sku": "TSH-XL-WHT",
                    "option_values": {
                        "size": "XL",
                        "color": "أبيض"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 12,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 11,
                    "title": "XL - أسود",
                    "sku": "TSH-XL-BLK",
                    "option_values": {
                        "size": "XL",
                        "color": "أسود"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 10,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 13,
                    "title": "XXL - أبيض",
                    "sku": "TSH-XXL-WHT",
                    "option_values": {
                        "size": "XXL",
                        "color": "أبيض"
                    },
                    "price": 89,
                    "sale_price": 69,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 11,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 14,
                    "title": "XXL - أسود",
                    "sku": "TSH-XXL-BLK",
                    "option_values": {
                        "size": "XXL",
                        "color": "أسود"
                    },
                    "price": 89,
                    "sale_price": 69,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 7,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 15,
                    "title": "XXL - أزرق",
                    "sku": "TSH-XXL-BLU",
                    "option_values": {
                        "size": "XXL",
                        "color": "أزرق"
                    },
                    "price": 89,
                    "sale_price": 69,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 6,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 2,
                    "title": "S - أسود",
                    "sku": "TSH-S-BLK",
                    "option_values": {
                        "size": "S",
                        "color": "أسود"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 17,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 1,
                    "title": "S - أبيض",
                    "sku": "TSH-S-WHT",
                    "option_values": {
                        "size": "S",
                        "color": "أبيض"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 14,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 12,
                    "title": "XL - أزرق",
                    "sku": "TSH-XL-BLU",
                    "option_values": {
                        "size": "XL",
                        "color": "أزرق"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 10,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 6,
                    "title": "M - أزرق",
                    "sku": "TSH-M-BLU",
                    "option_values": {
                        "size": "M",
                        "color": "أزرق"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 17,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 3,
                    "title": "S - أزرق",
                    "sku": "TSH-S-BLU",
                    "option_values": {
                        "size": "S",
                        "color": "أزرق"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 9,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 4,
                    "title": "M - أبيض",
                    "sku": "TSH-M-WHT",
                    "option_values": {
                        "size": "M",
                        "color": "أبيض"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 17,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 5,
                    "title": "M - أسود",
                    "sku": "TSH-M-BLK",
                    "option_values": {
                        "size": "M",
                        "color": "أسود"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 17,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 7,
                    "title": "L - أبيض",
                    "sku": "TSH-L-WHT",
                    "option_values": {
                        "size": "L",
                        "color": "أبيض"
                    },
                    "price": 79,
                    "sale_price": 59,
                    "sale_price_end_at": null,
                    "has_discount": true,
                    "is_available": true,
                    "available_quantity": 3,
                    "calories": null,
                    "shipping_weight": null
                }
            ],
            "created_at": "2026-02-10T16:32:43.000000Z"
        },
        {
            "id": 7,
            "title": "حذاء رياضي",
            "subtitle": "خفيف ومريح",
            "promotional_title": null,
            "description": "حذاء رياضي مناسب للجري والتمارين اليومية",
            "slug": "sports-shoes",
            "type": {
                "value": 1,
                "name": "SHIPPABLE",
                "label": "Shippable Product",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/shoes.jpg",
            "image_urls": [],
            "price": 299,
            "sale_price": null,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": false,
            "sku": "SHO-SPORT-001",
            "is_available": true,
            "available_quantity": 50,
            "unlimited_quantity": false,
            "max_quantity_per_customer": 3,
            "is_featured": false,
            "is_latest": true,
            "is_pinned_home": false,
            "is_variation": true,
            "allow_notes": false,
            "calories": null,
            "shipping_weight": 0.8000000000000000444089209850062616169452667236328125,
            "return_period_days": 30,
            "replacement_period_days": 14,
            "brand": {
                "id": 5,
                "name": "Adidas",
                "slug": "adidas",
                "image_url": "https://dashboard.libro-shop.com/storage/tenants/1/brands/adidas.png"
            },
            "categories": [
                {
                    "id": 4,
                    "name": "ملابس",
                    "slug": "clothes",
                    "image_url": null
                }
            ],
            "variants": [
                {
                    "id": 16,
                    "title": "مقاس 40",
                    "sku": "SHO-40",
                    "option_values": {
                        "size": "40"
                    },
                    "price": 299,
                    "sale_price": null,
                    "sale_price_end_at": null,
                    "has_discount": false,
                    "is_available": true,
                    "available_quantity": 10,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 17,
                    "title": "مقاس 41",
                    "sku": "SHO-41",
                    "option_values": {
                        "size": "41"
                    },
                    "price": 299,
                    "sale_price": null,
                    "sale_price_end_at": null,
                    "has_discount": false,
                    "is_available": true,
                    "available_quantity": 8,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 18,
                    "title": "مقاس 42",
                    "sku": "SHO-42",
                    "option_values": {
                        "size": "42"
                    },
                    "price": 299,
                    "sale_price": null,
                    "sale_price_end_at": null,
                    "has_discount": false,
                    "is_available": true,
                    "available_quantity": 9,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 19,
                    "title": "مقاس 43",
                    "sku": "SHO-43",
                    "option_values": {
                        "size": "43"
                    },
                    "price": 299,
                    "sale_price": null,
                    "sale_price_end_at": null,
                    "has_discount": false,
                    "is_available": true,
                    "available_quantity": 5,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 20,
                    "title": "مقاس 44",
                    "sku": "SHO-44",
                    "option_values": {
                        "size": "44"
                    },
                    "price": 299,
                    "sale_price": null,
                    "sale_price_end_at": null,
                    "has_discount": false,
                    "is_available": true,
                    "available_quantity": 6,
                    "calories": null,
                    "shipping_weight": null
                },
                {
                    "id": 21,
                    "title": "مقاس 45",
                    "sku": "SHO-45",
                    "option_values": {
                        "size": "45"
                    },
                    "price": 299,
                    "sale_price": null,
                    "sale_price_end_at": null,
                    "has_discount": false,
                    "is_available": true,
                    "available_quantity": 3,
                    "calories": null,
                    "shipping_weight": null
                }
            ],
            "created_at": "2026-02-10T16:32:44.000000Z"
        },
        {
            "id": 8,
            "title": "ساعة هدية فاخرة",
            "subtitle": "هدية مثالية",
            "promotional_title": null,
            "description": "ساعة يد أنيقة مع إمكانية النقش",
            "slug": "luxury-gift-watch",
            "type": {
                "value": 1,
                "name": "SHIPPABLE",
                "label": "Shippable Product",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/watch.jpg",
            "image_urls": [],
            "price": 450,
            "sale_price": 399,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": true,
            "sku": "WAT-LUX-001",
            "is_available": true,
            "available_quantity": 19,
            "unlimited_quantity": false,
            "max_quantity_per_customer": 2,
            "is_featured": true,
            "is_latest": false,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": false,
            "calories": null,
            "shipping_weight": 0.1499999999999999944488848768742172978818416595458984375,
            "return_period_days": 30,
            "replacement_period_days": 14,
            "brand": {
                "id": 2,
                "name": "Samsung",
                "slug": "samsung",
                "image_url": "https://dashboard.libro-shop.com/storage/tenants/1/brands/samsung.png"
            },
            "categories": [],
            "variants": [],
            "custom_fields": [
                {
                    "id": 4,
                    "label": "نص النقش",
                    "name": "engraving_text",
                    "description": null,
                    "input_type": "text",
                    "max_limit": 30,
                    "options": null,
                    "is_required": true
                },
                {
                    "id": 5,
                    "label": "نوع الخط",
                    "name": "font_style",
                    "description": null,
                    "input_type": "select",
                    "max_limit": null,
                    "options": {
                        "عربي كلاسيكي": "arabic_classic",
                        "عربي حديث": "arabic_modern",
                        "إنجليزي": "english"
                    },
                    "is_required": true
                }
            ],
            "created_at": "2026-02-10T16:32:44.000000Z"
        },
        {
            "id": 9,
            "title": "صندوق هدايا فاخر",
            "subtitle": null,
            "promotional_title": null,
            "description": "صندوق هدايا يحتوي على شوكولاتة وعطر صغير",
            "slug": "luxury-gift-box",
            "type": {
                "value": 1,
                "name": "SHIPPABLE",
                "label": "Shippable Product",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/gift-box.jpg",
            "image_urls": [],
            "price": 199,
            "sale_price": null,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": false,
            "sku": "GIFT-BOX-001",
            "is_available": true,
            "available_quantity": null,
            "unlimited_quantity": true,
            "max_quantity_per_customer": null,
            "is_featured": false,
            "is_latest": true,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": false,
            "calories": null,
            "shipping_weight": 0.5,
            "return_period_days": 7,
            "replacement_period_days": 3,
            "brand": null,
            "categories": [],
            "variants": [],
            "custom_fields": [
                {
                    "id": 1,
                    "label": "اسم المُهدى إليه",
                    "name": "recipient_name",
                    "description": null,
                    "input_type": "text",
                    "max_limit": 50,
                    "options": null,
                    "is_required": true
                },
                {
                    "id": 2,
                    "label": "رسالة الإهداء",
                    "name": "gift_message",
                    "description": null,
                    "input_type": "textarea",
                    "max_limit": 200,
                    "options": null,
                    "is_required": false
                },
                {
                    "id": 3,
                    "label": "تغليف هدية",
                    "name": "gift_wrap",
                    "description": null,
                    "input_type": "boolean",
                    "max_limit": null,
                    "options": null,
                    "is_required": false
                }
            ],
            "created_at": "2026-02-10T16:32:44.000000Z"
        },
        {
            "id": 10,
            "title": "كتاب إلكتروني - فن البرمجة",
            "subtitle": null,
            "promotional_title": null,
            "description": "كتاب شامل عن أساسيات البرمجة للمبتدئين",
            "slug": "programming-ebook",
            "type": {
                "value": 3,
                "name": "DIGITAL_FILES",
                "label": "Digital Files",
                "requires_shipping": false,
                "is_digital": true
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/ebook.jpg",
            "image_urls": [],
            "price": 49,
            "sale_price": 29,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": true,
            "sku": "EBOOK-PROG-001",
            "is_available": true,
            "available_quantity": null,
            "unlimited_quantity": true,
            "max_quantity_per_customer": null,
            "is_featured": false,
            "is_latest": true,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": false,
            "calories": null,
            "shipping_weight": null,
            "return_period_days": 0,
            "replacement_period_days": 0,
            "brand": null,
            "categories": [
                {
                    "id": 3,
                    "name": "كتب دورات",
                    "slug": "books-courses",
                    "image_url": null
                }
            ],
            "variants": [],
            "created_at": "2026-02-10T16:32:44.000000Z"
        },
        {
            "id": 11,
            "title": "إصدار محدود - حقيبة جلدية",
            "subtitle": null,
            "promotional_title": null,
            "description": "حقيبة جلدية فاخرة إصدار محدود",
            "slug": "limited-leather-bag",
            "type": {
                "value": 1,
                "name": "SHIPPABLE",
                "label": "Shippable Product",
                "requires_shipping": true,
                "is_digital": false
            },
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/1/products/bag.jpg",
            "image_urls": [],
            "price": 899,
            "sale_price": null,
            "sale_price_end_at": null,
            "tax_rate": null,
            "has_discount": false,
            "sku": "BAG-LTD-001",
            "is_available": false,
            "available_quantity": 0,
            "unlimited_quantity": false,
            "max_quantity_per_customer": 1,
            "is_featured": true,
            "is_latest": false,
            "is_pinned_home": false,
            "is_variation": false,
            "allow_notes": false,
            "calories": null,
            "shipping_weight": 1.1999999999999999555910790149937383830547332763671875,
            "return_period_days": 30,
            "replacement_period_days": 14,
            "brand": null,
            "categories": [],
            "variants": [],
            "created_at": "2026-02-10T16:32:44.000000Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 11
    }
}
```

---

### 2. Get Filter Variables

Retrieve available filter options (prices, categories, brands, attributes, etc.) for building dynamic filter interfaces.

**Endpoint:** `GET /store/products/filters`

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter variables based on search term |
| `category_id` | integer | Filter variables for specific category |

#### Example Request

```http
GET {{base_url}}/store/products/filters
```

#### Success Response (200 OK)

```json
{
    "success": true,
    "message": "تم جلب متغيرات الفلترة بنجاح",
    "data": {
        "min_price": 16,
        "max_price": 899,
        "brands": [
            {
                "id": 5,
                "name": "Adidas",
                "count": 1
            },
            {
                "id": 4,
                "name": "Nike",
                "count": 1
            },
            {
                "id": 2,
                "name": "Samsung",
                "count": 1
            }
        ],
        "categories": [
            {
                "id": 1,
                "name": "الأطعمة والوجبات",
                "count": 3
            },
            {
                "id": 3,
                "name": "كتب دورات",
                "count": 1
            },
            {
                "id": 4,
                "name": "ملابس",
                "count": 2
            },
            {
                "id": 6,
                "name": "وجبات سريعة",
                "count": 3
            }
        ],
        "collections": [
            {
                "id": 1,
                "name": "عروض اليوم الوطني",
                "count": 4
            },
            {
                "id": 2,
                "name": "عروض رمضان",
                "count": 3
            }
        ],
        "attributes": [
            {
                "name": "Size",
                "slug": "size",
                "options": [
                    {
                        "value": "L",
                        "count": 3
                    },
                    {
                        "value": "XL",
                        "count": 3
                    },
                    {
                        "value": "XXL",
                        "count": 3
                    },
                    {
                        "value": 40,
                        "count": 1
                    },
                    {
                        "value": 41,
                        "count": 1
                    },
                    {
                        "value": 42,
                        "count": 1
                    },
                    {
                        "value": 43,
                        "count": 1
                    },
                    {
                        "value": 44,
                        "count": 1
                    },
                    {
                        "value": 45,
                        "count": 1
                    },
                    {
                        "value": "S",
                        "count": 3
                    },
                    {
                        "value": "M",
                        "count": 3
                    }
                ]
            },
            {
                "name": "Color",
                "slug": "color",
                "options": [
                    {
                        "value": "أسود",
                        "count": 5
                    },
                    {
                        "value": "أزرق",
                        "count": 5
                    },
                    {
                        "value": "أبيض",
                        "count": 5
                    }
                ]
            }
        ],
        "availability_status": [
            {
                "value": "in_stock",
                "label": "In Stock",
                "arabic_label": "متوفر",
                "count": 10
            },
            {
                "value": "out_of_stock",
                "label": "Out of Stock",
                "arabic_label": "غير متوفر",
                "count": 1
            }
        ],
        "calories_range": {
            "min": 120,
            "max": 1100
        },
        "weight_range": {
            "min": 0.1499999999999999944488848768742172978818416595458984375,
            "max": 1.1999999999999999555910790149937383830547332763671875
        },
        "max_rating": 5,
        "has_discount": true,
        "has_variants": true
    }
}
```

#### Filter Variables Description

| Field | Description |
|-------|-------------|
| `min_price` / `max_price` | نطاق الأسعار \| Price range |
| `brands` | العلامات التجارية مع العدد \| Brands with count |
| `categories` | الفئات مع العدد \| Categories with count |
| `collections` | المجموعات \| Collections |
| `availability_status` | حالة التوفر \| Availability status |
| `attributes` | الخصائص الديناميكية \| Dynamic attributes |
| `calories_range` | نطاق السعرات (للمطاعم) \| Calories range |
| `weight_range` | نطاق الوزن \| Weight range |
| `max_rating` | أقصى تقييم \| Maximum rating |
| `has_discount` | يوجد تخفيضات \| Has discounts |
| `has_variants` | يوجد خيارات \| Has variants |

#### Use Cases

1. Build dynamic filter UI with counts
2. Show available filter options to users
3. Display price range slider with min/max values
4. Category navigation with product counts
5. Attribute-based filtering (size, color, etc.)

---

### 3. Product Details

Get detailed information about a specific product including variants, addons, and custom fields.

**Endpoint:** `GET /store/products/{id}`

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Product ID or slug |

#### Headers

| Header | Type | Description |
|--------|------|-------------|
| `X-Branch-Id` | integer | Optional - Get branch-specific stock levels and pricing |

#### Example Request

```http
GET {{base_url}}/store/products/classic-burger
X-Branch-Id: 1
```

#### Response Includes

- Product details (title, description, images)
- Variants with branch-specific stock (if `X-Branch-Id` provided)
- Addons and addon items with pricing
- Custom fields configuration
- Branch-specific pricing and availability

---

## Product Types

| Value | Name | Description |
|-------|------|-------------|
| 1 | SHIPPABLE | Physical products that require shipping |
| 2 | DIGITAL_LICENSE | Digital licenses/codes |
| 3 | DIGITAL_FILES | Downloadable digital files |
| 4 | SERVICE | Services (no shipping) |
| 6 | FOOD | Food and beverage items |

## Availability Status

| Value | Description |
|-------|-------------|
| `in_stock` | Product is available for purchase |
| `out_of_stock` | Product is currently unavailable |
| `low_stock` | Product has limited stock |
