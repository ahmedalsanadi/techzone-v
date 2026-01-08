# Libero Store API - Products & Categories Documentation (Store App Only)

## Overview
This documentation covers the **Products and Categories endpoints** for the Libero Store API **Customer-facing application**. The Store App is the customer portal for browsing products, viewing categories, and making purchases.


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

#### 🔐 Authentication: **Customer token required**

#### 📝 Example Requests:

**Basic Product Browsing:**
```http
# Get first page of products

# Search for specific products
GET /store/products?search=برجر

# Browse by category
GET /store/products?category_id=5
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
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 123,
      "title": "برجر كلاسيكي",
      "description": "برجر لحم بقري مع جبنة وخس وطماطم",
      "price": 25.00,
      "sale_price": 22.50,
      "cover_image_url": "https://cdn.store.com/products/burger.jpg",
      "is_available": true,
      "is_featured": true,
      "type": "FOOD",
      "category": {
        "id": 1,
        "name": "الوجبات السريعة"
      },
      "brand": {
        "id": 2,
        "name": "مطعم الشيف"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 72,
    "links": {
      "first": "/store/products?page=1",
      "last": "/store/products?page=5",
      "prev": null,
      "next": "/store/products?page=2"
    }
  }
}
```

### 2. Get Product Details
**GET** `/store/products/{id}`

Get complete product information including variants, addons, custom fields, and images. Essential for product detail pages.

#### 🎯 URL Parameters:
- `id` **(required)**: Product ID (integer)


#### 📦 Response Includes:
- Basic product info (title, description, price)
- **Variants** (sizes, colors, options with different prices)
- **Addons** (extra toppings, sides with prices)
- **Custom fields** (gift messages, special instructions)
- **Images gallery** (multiple product images)
- **Availability status** (in stock/out of stock)
- **Category & brand info**
- **Reviews & ratings** (if enabled)

#### Example Response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "برجر كلاسيكي",
    "description": "برجر لحم بقري مع جبنة وخس وطماطم",
    "price": 25.00,
    "sale_price": 22.50,
    "is_available": true,
    "stock_quantity": 50,
    "type": "FOOD",
    "images": [
      "https://cdn.store.com/products/burger-1.jpg",
      "https://cdn.store.com/products/burger-2.jpg"
    ],
    "variants": [
      {
        "id": 456,
        "name": "الحجم",
        "options": [
          {"id": 1, "name": "صغير", "price_adjustment": -5},
          {"id": 2, "name": "وسط", "price_adjustment": 0},
          {"id": 3, "name": "كبير", "price_adjustment": 8}
        ]
      }
    ],
    "addons": [
      {
        "id": 789,
        "name": "إضافات",
        "items": [
          {"id": 1, "name": "جبنة إضافية", "price": 3.00},
          {"id": 2, "name": "بيكن", "price": 5.00}
        ]
      }
    ],
    "custom_fields": [
      {
        "id": 1,
        "name": "رسالة الهدية",
        "type": "text",
        "is_required": false
      }
    ]
  }
}
```

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

#### 🔐 Authentication: **Customer token required**

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
  "data": [
    {
      "id": 1,
      "name": "الوجبات السريعة",
      "slug": "fast-food",
      "image_url": "https://cdn.store.com/categories/fast-food.jpg",
      "children": [
        {
          "id": 2,
          "name": "برجر",
          "slug": "burgers",
          "image_url": "https://cdn.store.com/categories/burgers.jpg",
          "children": []
        },
        {
          "id": 3,
          "name": "بيتزا",
          "slug": "pizza",
          "image_url": "https://cdn.store.com/categories/pizza.jpg",
          "children": []
        }
      ]
    },
    {
      "id": 4,
      "name": "المشروبات",
      "slug": "drinks",
      "image_url": "https://cdn.store.com/categories/drinks.jpg",
      "children": []
    }
  ]
}
```

**Flat List Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "الوجبات السريعة",
      "slug": "fast-food",
      "image_url": "https://cdn.store.com/categories/fast-food.jpg",
      "parent_id": null
    },
    {
      "id": 2,
      "name": "برجر",
      "slug": "burgers",
      "image_url": "https://cdn.store.com/categories/burgers.jpg",
      "parent_id": 1
    }
  ]
}
```

### 2. Get Category Details
**GET** `/store/categories/{id}`

Get detailed information about a specific category.

#### 🎯 URL Parameters:
- `id` **(required)**: Category ID (integer)



#### 📝 Example Request:
```http
GET /store/categories/2
```

#### 📦 Response:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "برجر",
    "description": "تشكيلة متنوعة من البرجر الطازج",
    "slug": "burgers",
    "image_url": "https://cdn.store.com/categories/burgers.jpg",
    "parent_id": 1,
    "meta_title": "برجر لذيذ - مطعمنا",
    "meta_description": "استمتع بأفضل أنواع البرجر",
    "display_order": 1,
    "is_active": true
  }
}
```


### 6. **Caching Strategy**
```javascript
// Cache categories (rarely change)
let categoriesCache = null;
let categoriesCacheTime = null;

async function getCachedCategories(forceRefresh = false) {
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  if (!forceRefresh && 
      categoriesCache && 
      categoriesCacheTime && 
      (Date.now() - categoriesCacheTime < CACHE_DURATION)) {
    return categoriesCache;
  }
  
  categoriesCache = await getCategories({ tree: true });
  categoriesCacheTime = Date.now();
  return categoriesCache;
}
```
`

---

## ⚠️ Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|

| `429 Too Many Requests` | Rate limit exceeded | Implement exponential backoff |
| Empty product list | Category has no products | Check category_id parameter |
| No search results | Search term too specific | Broaden search or remove filters |
| Arabic text issues | Wrong Accept-Language | Set Accept-Language: ar |

---

## 📚 Quick Reference

### Endpoints Summary:
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/store/products` | Browse/search products | ✅ |
| GET | `/store/products/{id}` | Product details | ✅ |
| GET | `/store/categories` | Get categories | ✅ |
| GET | `/store/categories/{id}` | Category details | ✅ |



This documentation provides everything an AI agent needs to interact with the Libero Store API's Products and Categories endpoints effectively.