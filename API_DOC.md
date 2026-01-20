# Libero Store API - Products & Categories Documentation (Store App Only)

## Overview
This documentation covers the **Products and Categories endpoints** for the Libero Store API **Customer-facing application**. The Store App is the customer portal for browsing products, viewing categories, and making purchases.

## Required Headers
All endpoints require the following headers:

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| `X-Store-Key` | **Yes** | Tenant identifier | `37858998-3343-4293-98ac-1e28cc0f9e27` |
| `Authorization` | **No** (Optional) | Bearer token for authenticated users | `Bearer 1|abc123...` |
| `Accept-Language` | **Yes** | Language preference: `ar` or `en` | `ar` |
| `Accept` | **Yes** | Response format | `application/json` |

**Note:** Most endpoints work without authentication, but some features may be enhanced for logged-in users.

---

## 🛍️ Products Endpoints

### Base Path: `/store/products`

### 1. List Products (Browse & Search)
**GET** `/store/products`

Retrieve products with powerful filtering, searching, and sorting capabilities. Perfect for product listing pages, search results, and featured sections.

#### 📋 Query Parameters:

| Parameter | Type | Required | Default | Description | Use Case |
|-----------|------|----------|---------|-------------|----------|
| `search` | string | ❌ | - | Search in title & description | Search box |
| `category_id` | integer | ❌ | - | Filter by category ID | Category pages |
| `brand_id` | integer | ❌ | - | Filter by brand ID | Brand pages |
| `collection_id` | integer | ❌ | - | Filter by collection ID | Special offers |
| `is_featured` | boolean | ❌ | - | Featured products only | Homepage hero |
| `is_latest` | boolean | ❌ | - | Latest products only | "New Arrivals" |
| `min_price` | number | ❌ | - | Minimum price | Price filter |
| `max_price` | number | ❌ | - | Maximum price | Price filter |
| `sort` | string | ❌ | `created_at` | Field: `price`, `title`, `created_at` | Sorting |
| `order` | string | ❌ | `asc` | Direction: `asc`, `desc` | Sorting |
| `page` | integer | ❌ | `1` | Page number | Pagination |
| `per_page` | integer | ❌ | `15` | Items per page (1-100) | Pagination |

#### 📝 Example Requests:

**Basic Product Browsing:**
```http
# Get first page of products (default)
GET /store/products

# Search for specific products
GET /store/products?search=برجر

# Browse by category
GET /store/products?category_id=5

# Filter by brand
GET /store/products?brand_id=2
```

**Featured & Special Sections:**
```http
# Get featured products for homepage
GET /store/products?is_featured=true&per_page=8

# Get latest products for "New Arrivals"
GET /store/products?is_latest=true&sort=created_at&order=desc

# Featured products in a specific category
GET /store/products?category_id=3&is_featured=true
```

**Advanced Filtering:**
```http
# Price range filtering
GET /store/products?min_price=50&max_price=200

# Price sorting (low to high)
GET /store/products?sort=price&order=asc

# Price sorting (high to low)
GET /store/products?sort=price&order=desc

# Combined filters (category + price range + sorting)
GET /store/products?category_id=1&min_price=20&max_price=100&sort=price&order=asc&per_page=20
```

**Full Search Experience:**
```http
# Search with price range
GET /store/products?search=قهوة&min_price=10&max_price=50

# Search in category
GET /store/products?search=دجاج&category_id=2

# Complete example
GET /store/products?search=برجر&category_id=1&brand_id=5&min_price=30&max_price=80&sort=price&order=asc&per_page=12&page=2
```

#### 📦 Response Format:
```json
{
    "success": true,
    "message": "تم جلب المنتجات بنجاح",
    "data": [
        {
            "id": 1,
            "title": "برجر كلاسيكي",
            "slug": "classic-burger",
            "price": 25,
            "sale_price": null,
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
            "is_available": true,
            "type": "FOOD"
        },
        {
            "id": 2,
            "title": "دبل تشيز برجر",
            "slug": "double-cheese-burger",
            "price": 42,
            "sale_price": 35,
            "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-double.jpg",
            "is_available": true,
            "type": "FOOD"
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

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Product unique identifier |
| `title` | string | Product name |
| `slug` | string | URL-friendly product name |
| `price` | number | Original price |
| `sale_price` | number/null | Discounted price (if any) |
| `cover_image_url` | string | Main product image |
| `is_available` | boolean | Availability status |
| `type` | string | Product type: `FOOD`, `SHIPPABLE`, `DIGITAL_FILES` |

---

### 2. Get Product Details
**GET** `/store/products/{id-or-slug}`

Get complete product information including variants, addons, custom fields, and images. Essential for product detail pages.

#### 🎯 URL Parameters:
- `id-or-slug` **(required)**: Product ID (integer) or Slug (string)

#### 📝 Example Requests:
```http
# Using product ID
GET /store/products/1

# Using product slug
GET /store/products/classic-burger
```

#### 📦 Response Format:
```json
{
    "success": true,
    "message": "تم جلب المنتج بنجاح",
    "data": {
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
        "cover_image_url": "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic.jpg",
        "image_urls": [
            "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic-1.jpg",
            "https://dashboard.libro-shop.com/storage/tenants/fashioncorner/products/burger-classic-2.jpg"
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
                    }
                ]
            }
        ],
        "created_at": "2026-01-20T15:44:25.000000Z"
    }
}
```

**Key Response Sections:**

1. **Product Basic Info:**
   - `title`, `description`, `price`, `sale_price`
   - `is_available`, `unlimited_quantity`
   - `type`: Product type with shipping/digital flags

2. **Images:**
   - `cover_image_url`: Main image
   - `image_urls`: Array of additional images

3. **Categories:**
   - `categories`: Array of category objects this product belongs to

4. **Addons (Optional):**
   ```json
   "addons": [
     {
       "id": 1,
       "name": "الصوصات",
       "input_type": "boolean",  // or "number"
       "min_selected": 0,
       "max_selected": 3,
       "is_required": false,
       "items": [
         {
           "id": 1,
           "title": "كاتشب",
           "extra_price": 0,  // Additional cost
           "max_quantity": null,  // Unlimited if null
           "multiply_price_by_quantity": false  // If true: price × quantity
         }
       ]
     }
   ]
   ```

5. **Product Flags:**
   - `is_featured`: Featured product
   - `is_latest`: Recently added
   - `is_pinned_home`: Pinned to homepage
   - `allow_notes`: Allow customer notes

---

## 📂 Categories Endpoints

### Base Path: `/store/categories`

### 1. List Categories (Navigation)
**GET** `/store/categories`

Get the category hierarchy for store navigation. Supports both flat list and tree structure.

#### 📋 Query Parameters:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tree` | boolean | ❌ | `false` | Return hierarchical tree when `true` |
| `parent_id` | integer | ❌ | - | Get children of specific category |

#### 📝 Example Requests:

**For Navigation Menu (Tree Structure):**
```http
# Get full category tree - perfect for navigation menus
GET /store/categories?tree=true
```

**For Dropdowns/Filtering (Flat List):**
```http
# Get all categories as flat list - good for filters
GET /store/categories
```

**Get Specific Category Children:**
```http
# Get subcategories of category ID 5
GET /store/categories?parent_id=5
```

#### 📦 Response Formats:

**Tree Structure Response (tree=true):**
```json
{
    "success": true,
    "message": "تم جلب التصنيفات بنجاح",
    "data": [
        {
            "id": 1,
            "name": "الأطعمة والوجبات",
            "slug": "food-meals",
            "description": "جميع أنواع الأطعمة والوجبات",
            "image_url": null,
            "icon_url": null,
            "bg_color": null,
            "parent_id": null,
            "level": null,
            "show_in_menu": true,
            "children": [
                {
                    "id": 6,
                    "name": "وجبات سريعة",
                    "slug": "fast-food",
                    "description": "الوجبات السريعة والأطعمة الجاهزة",
                    "image_url": null,
                    "icon_url": null,
                    "bg_color": null,
                    "parent_id": 1,
                    "level": null,
                    "show_in_menu": true
                }
            ]
        }
    ]
}
```

**Flat List Response (default):**
```json
{
    "success": true,
    "message": "تم جلب التصنيفات بنجاح",
    "data": [
        {
            "id": 1,
            "name": "الأطعمة والوجبات",
            "slug": "food-meals",
            "description": "جميع أنواع الأطعمة والوجبات",
            "image_url": null,
            "icon_url": null,
            "bg_color": null,
            "parent_id": null,
            "level": null,
            "show_in_menu": true
        },
        {
            "id": 2,
            "name": "قطع أطفال",
            "slug": "kids-items",
            "description": "منتجات وملابس الأطفال",
            "image_url": null,
            "icon_url": null,
            "bg_color": null,
            "parent_id": null,
            "level": null,
            "show_in_menu": false
        }
    ]
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Category ID |
| `name` | string | Category name |
| `slug` | string | URL-friendly name |
| `description` | string | Category description |
| `image_url` | string/null | Category image |
| `parent_id` | integer/null | Parent category ID (null for root) |
| `show_in_menu` | boolean | Should appear in navigation |
| `children` | array | Subcategories (only when tree=true) |

---

### 2. Get Category Details
**GET** `/store/categories/{id-or-slug}`

Get detailed information about a specific category.

#### 🎯 URL Parameters:
- `id-or-slug` **(required)**: Category ID (integer) or Slug (string)

#### 📝 Example Requests:
```http
# Using category ID
GET /store/categories/1

# Using category slug
GET /store/categories/food-meals
```

#### 📦 Response:
```json
{
    "success": true,
    "message": "تم جلب التصنيف بنجاح",
    "data": {
        "id": 1,
        "name": "الأطعمة والوجبات",
        "slug": "food-meals",
        "description": "جميع أنواع الأطعمة والوجبات",
        "image_url": null,
        "icon_url": null,
        "bg_color": null,
        "parent_id": null,
        "level": null,
        "show_in_menu": true
    }
}
```

---

## 🔄 Product Types Reference

| Type Name | Label | Requires Shipping | Is Digital | Example Products |
|-----------|-------|-------------------|------------|------------------|
| `FOOD` | Food | ✅ | ❌ | برجر، بيتزا، مشروبات |
| `SHIPPABLE` | Shippable | ✅ | ❌ | ملابس، إلكترونيات، أثاث |
| `DIGITAL_FILES` | Digital Files | ❌ | ✅ | كتب إلكترونية، دورات، برامج |

---

## ⚠️ Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Missing or invalid headers | Add `X-Store-Key` and `Accept-Language` headers |
| `404 Not Found` | Invalid product/category ID | Verify the ID/slug exists |
| Empty product list | Category has no products | Try different category or remove `category_id` filter |
| Arabic text issues | Wrong Accept-Language | Set `Accept-Language: ar` |
| `429 Too Many Requests` | Rate limit exceeded | Implement exponential backoff (60 requests/minute) |
| No search results | Search term too specific | Broaden search or check spelling |

---

###  **Error Handling:**
```javascript
try {
  const response = await fetch('/store/products');
  
  if (!response.ok) {
    if (response.status === 401) {
      // Handle authentication
      console.error('Missing required headers');
    } else if (response.status === 429) {
      // Rate limited
      console.error('Too many requests - wait and retry');
    }
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    console.error('API Error:', data.message);
  }
  
  return data;
} catch (error) {
  console.error('Network error:', error);
  // Implement retry logic
}
```

## 📚 Quick Reference

### Endpoints Summary:
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/store/products` | Browse/search products | ❌ |
| GET | `/store/products/{id}` | Product details | ❌ |
| GET | `/store/categories` | Get categories | ❌ |
| GET | `/store/categories/{id}` | Category details | ❌ |

### Rate Limits:
- **Store endpoints:** 60 requests/minute per IP
- Use `Accept-Language: ar` for Arabic responses
- Always include `X-Store-Key` header

### Response Structure:
All responses follow this pattern:
```json
{
  "success": true/false,
  "message": "Descriptive message",
  "data": {},  // or [] for lists
  "meta": {}   // pagination info for lists
}
```

---

## 📞 Support

For issues with Products & Categories API:
1. Check `X-Store-Key` is correct
2. Verify `Accept-Language` header is set
3. Ensure URL parameters are properly encoded
4. Check product/category IDs exist

**Example Working Request:**
```http
GET /store/products?category_id=1&is_featured=true
X-Store-Key: 37858998-3343-4293-98ac-1e28cc0f9e27
Accept-Language: ar
Accept: application/json
```

---
*Last Updated: January 2024*