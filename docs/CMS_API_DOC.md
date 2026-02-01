# 📄 CMS Pages | الصفحات

إدارة صفحات المحتوى (من نحن، الشروط، سياسة الخصوصية، إلخ).  
Manage content pages (About, Terms, Privacy, etc.).

---

## 🎯 Features | المميزات

- **Two Endpoints**: قائمة (بدون محتوى) + صفحة واحدة (مع محتوى) | List (minimal) + Single (full)
- **HTML & Text Support**: دعم HTML ونص عادي | Supports HTML and plain text
- **Menu & Footer Flags**: علامات للقائمة والفوتر | Menu and footer visibility flags
- **Multilingual**: دعم متعدد اللغات | Multilingual support
- **Public Access**: لا تحتاج تسجيل دخول | No authentication required

---

## 📋 Usage Flow | تدفق الاستخدام

1. **App Launch**: جلب قائمة الصفحات | Fetch pages list
2. **Build Menu/Footer**: فلترة حسب `show_in_menu` / `show_in_footer` | Filter by flags
3. **User Clicks**: جلب المحتوى الكامل | Fetch full content
4. **Render**: عرض HTML أو نص | Render HTML or text

---

## 💾 Caching Strategy | استراتيجية التخزين

- **List**: Cache for 24 hours
- **Single Page**: Cache for 1 week
- **Update**: On app launch or manual refresh

---

## 🎨 Page Types | أنواع الصفحات

- **`html`**: محتوى HTML مع تنسيق | HTML content with formatting
- **`text`**: نص عادي بدون تنسيق | Plain text without formatting

---

## Endpoints

### 1. List Pages
**جلب قائمة الصفحات (من نحن، الشروط، سياسة الخصوصية، إلخ).**  
Get list of CMS pages (About, Terms, Privacy, etc.).

#### 🔗 Endpoint
```
GET /store/pages
```

#### 📝 Request Headers
| Key | Value | Description |
|-----|-------|-------------|
| `X-Store-Key` | `{{store_key}}` | Store identifier |
| `Accept` | `application/json` | Response format |
| `Accept-Language` | `ar` | Language preference |

#### ✅ Response (Minimal - without content)
```json
{
  "success": true,
  "message": "تم جلب الصفحات بنجاح",
  "data": [
    {
      "id": 1,
      "title": "من نحن",
      "slug": "about-us",
      "type": "html",
      "show_in_menu": true,
      "show_in_footer": true
    },
    {
      "id": 2,
      "title": "الشروط والأحكام",
      "slug": "terms",
      "type": "html",
      "show_in_menu": false,
      "show_in_footer": true
    }
  ]
}
```

#### 💡 Use Cases
1. **Build Menu**: Filter by `show_in_menu: true`
2. **Build Footer**: Filter by `show_in_footer: true`
3. **Page Type**: Use `type` to render HTML or plain text

#### 📌 Notes
- ✅ Returns minimal data (without content) for performance
- ✅ Only published pages are returned
- ✅ Use slug to fetch full page content

---

### 2. Get Page by Slug
**جلب صفحة واحدة مع المحتوى الكامل.**  
Get single page with full content.

#### 🔗 Endpoint
```
GET /store/pages/{slug}
```

#### 📋 URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | **Yes** | Page slug (e.g., "about-us", "terms", "privacy") |

#### 📝 Request Headers
| Key | Value | Description |
|-----|-------|-------------|
| `X-Store-Key` | `{{store_key}}` | Store identifier |
| `Accept` | `application/json` | Response format |
| `Accept-Language` | `ar` | Language preference |

#### ✅ Response (Full - with content)
```json
{
  "success": true,
  "message": "تم جلب الصفحة بنجاح",
  "data": {
    "id": 1,
    "title": "من نحن",
    "slug": "about-us",
    "description": "تعرف على قصتنا ورؤيتنا",
    "type": "html",
    "content": "<h1>من نحن</h1><p>نحن شركة رائدة...</p>",
    "show_in_menu": true,
    "show_in_footer": true
  }
}
```
another reponse example:

```json
{
    "success": true,
    "message": "تم جلب الصفحة بنجاح",
    "data": {
        "id": 1,
        "title": "عن المتجر",
        "slug": "about-us",
        "description": "صفحة تعريفية عن المتجر وتاريخ تأسيسه",
        "type": "html",
        "content": "<div class=\"about-page\">\n                    <h1>عن متجرنا</h1>\n                    <p>نحن متجر إلكتروني رائد في المملكة العربية السعودية، نقدم أفضل المنتجات بأعلى جودة وأفضل الأسعار.</p>\n                    <h2>رؤيتنا</h2>\n                    <p>أن نكون الوجهة الأولى للتسوق الإلكتروني في المنطقة.</p>\n                    <h2>رسالتنا</h2>\n                    <p>تقديم تجربة تسوق استثنائية لعملائنا مع ضمان الجودة والأمان.</p>\n                </div>",
        "show_in_menu": true,
        "show_in_footer": true
    }
}
```