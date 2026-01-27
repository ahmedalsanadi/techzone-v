# Customer Addresses API Documentation

## Customer Addresses | عناوين العملاء

إدارة عناوين التوصيل للعملاء.

Manage customer delivery addresses.

### Features | المميزات

- **Multiple Addresses**: يمكن للعميل إضافة عناوين متعددة | Customer can add multiple addresses
- **Default Address**: عنوان افتراضي واحد لكل عميل | One default address per customer
- **Auto-Default**: أول عنوان يتم إنشاؤه يصبح افتراضياً تلقائياً | First address created becomes default automatically
- **Auto-Reassign**: عند حذف العنوان الافتراضي، يتم تعيين عنوان آخر تلقائياً | When default is deleted, another address is auto-assigned
- **Labels**: تسميات مخصصة (منزل، عمل، إلخ) | Custom labels (home, work, etc.)
- **Saudi Format**: يدعم تنسيق العناوين السعودية | Supports Saudi address format

### Address Fields | حقول العنوان

- **label**: تسمية العنوان | Address label
- **recipient_name**: اسم المستلم | Recipient name
- **phone**: رقم الهاتف | Phone number
- **country**: الدولة | Country
- **city**: المدينة | City
- **district**: الحي | District
- **street**: الشارع | Street
- **building_number**: رقم المبنى | Building number
- **postal_code**: الرمز البريدي | Postal code
- **additional_number**: الرقم الإضافي | Additional number
- **unit_number**: رقم الوحدة | Unit number
- **notes**: ملاحظات | Notes

---

## Endpoints | النقاط الطرفية

### 1. List Addresses

#### Request | الطلب
```http
GET {{base_url}}/store/addresses
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
Authorization: Bearer {{customer_token}}
```

#### Query Parameters | معاملات الاستعلام
- `default` (boolean, optional): تصفية حسب العنوان الافتراضي | Filter by default address
- `label` (string, optional): تصفية حسب التسمية (منزل، عمل، إلخ) | Filter by label (home, work, etc.)

#### Description | الوصف
جلب قائمة عناوين العميل مع إمكانية التصفية.

Get customer's addresses list with optional filtering.

#### Examples | أمثلة
- Get all addresses: `GET /store/addresses`
- Get default address only: `GET /store/addresses?default=true`
- Get home addresses: `GET /store/addresses?label=home`

#### Response | الرد
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "label": "home",
      "recipient_name": "محمد أحمد",
      "phone": "0501234567",
      "country_id": 1,
      "country_name": "المملكة العربية السعودية",
      "city_id": 1,
      "city_name": "الرياض",
      "district_id": 1,
      "district_name": "العليا",
      "street": "King Fahd Road",
      "building": "1234",
      "unit": "15",
      "postal_code": "12345",
      "additional_number": "5678",
      "description": "Near Al Faisaliah Tower",
      "is_default": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Address

#### Request | الطلب
```http
GET {{base_url}}/store/addresses/:id
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
Authorization: Bearer {{customer_token}}
```

#### URL Parameters | معاملات الرابط
- `id` (integer, required): معرف العنوان | Address ID

#### Description | الوصف
جلب تفاصيل عنوان محدد.

Get specific address details.

#### Response | الرد
```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "home",
    "recipient_name": "محمد أحمد",
    "phone": "0501234567",
    "country_id": 1,
    "country_name": "المملكة العربية السعودية",
    "city_id": 1,
    "city_name": "الرياض",
    "district_id": 1,
    "district_name": "العليا",
    "street": "King Fahd Road",
    "building": "1234",
    "unit": "15",
    "postal_code": "12345",
    "additional_number": "5678",
    "description": "Near Al Faisaliah Tower",
    "is_default": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Errors | الأخطاء
- **404**: Address not found | العنوان غير موجود
- **403**: Address doesn't belong to customer | العنوان لا ينتمي للعميل

---

### 3. Create Address

#### Request | الطلب
```http
POST {{base_url}}/store/addresses
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{customer_token}}
```

#### Body Parameters | معاملات الطلب
##### Required | مطلوب
- `phone` (string): رقم الهاتف | Phone number
- `country_id` (integer): معرف الدولة | Country ID
- `city_id` (integer): معرف المدينة | City ID
- `street` (string): الشارع | Street

##### Optional | اختياري
- `recipient_name` (string): اسم المستلم | Recipient name
- `label` (string): تسمية العنوان (home, work, other) | Address label
- `district_id` (integer): معرف الحي | District ID
- `building` (string): رقم المبنى | Building number
- `unit` (string): رقم الوحدة | Unit number
- `postal_code` (string): الرمز البريدي | Postal code
- `additional_number` (string): الرقم الإضافي | Additional number
- `description` (string): ملاحظات | Notes/Description
- `is_default` (boolean): تعيين كعنوان افتراضي | Set as default address

#### Request Body | نص الطلب
```json
{
  "label": "home",
  "recipient_name": "محمد أحمد",
  "phone": "0501234567",
  "country_id": 1,
  "city_id": 1,
  "district_id": 1,
  "street": "King Fahd Road",
  "building": "1234",
  "unit": "15",
  "postal_code": "12345",
  "additional_number": "5678",
  "description": "Near Al Faisaliah Tower",
  "is_default": true
}
```

#### Description | الوصف
إنشاء عنوان جديد للعميل.

Create a new address for the customer.

#### Behavior | السلوك
- إذا كان هذا أول عنوان للعميل، سيتم تعيينه تلقائياً كعنوان افتراضي
- If this is the customer's first address, it will be automatically set as default
- إذا تم تعيين `is_default: true`، سيتم إلغاء العنوان الافتراضي السابق
- If `is_default: true` is set, the previous default address will be unset

#### Example | مثال
عنوان في الرياض، المملكة العربية السعودية.

Address in Riyadh, Saudi Arabia.

#### Response | الرد
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "id": 2,
    "label": "home",
    "recipient_name": "محمد أحمد",
    "phone": "0501234567",
    "country_id": 1,
    "country_name": "المملكة العربية السعودية",
    "city_id": 1,
    "city_name": "الرياض",
    "district_id": 1,
    "district_name": "العليا",
    "street": "King Fahd Road",
    "building": "1234",
    "unit": "15",
    "postal_code": "12345",
    "additional_number": "5678",
    "description": "Near Al Faisaliah Tower",
    "is_default": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Update Address

#### Request | الطلب
```http
PUT {{base_url}}/store/addresses/:id
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{customer_token}}
```

#### URL Parameters | معاملات الرابط
- `id` (integer, required): معرف العنوان | Address ID

#### Request Body | نص الطلب
```json
{
  "label": "work",
  "recipient_name": "محمد أحمد",
  "phone": "0501234567",
  "country_id": 1,
  "city_id": 2,
  "district_id": 5,
  "street": "Prince Mohammed Bin Abdulaziz Road",
  "building": "5678",
  "unit": "201",
  "postal_code": "23323",
  "additional_number": "1234",
  "description": "Office building, 2nd floor",
  "is_default": true
}
```

#### Description | الوصف
تحديث عنوان موجود.

Update an existing address.

#### Body Parameters | معاملات الطلب
نفس معاملات إنشاء العنوان.

Same parameters as Create Address.

#### Setting Default Address | تعيين العنوان الافتراضي
لتعيين هذا العنوان كعنوان افتراضي، أضف `is_default: true` في الطلب.

To set this address as default, include `is_default: true` in the request.

#### Behavior | السلوك
- عند تعيين `is_default: true`، سيتم إلغاء العنوان الافتراضي السابق تلقائياً
- When setting `is_default: true`, the previous default address will be automatically unset
- يمكن تحديث جميع الحقول أو بعضها فقط
- All fields or only some can be updated

#### Response | الرد
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": 1,
    "label": "work",
    "recipient_name": "محمد أحمد",
    "phone": "0501234567",
    "country_id": 1,
    "country_name": "المملكة العربية السعودية",
    "city_id": 2,
    "city_name": "جدة",
    "district_id": 5,
    "district_name": "السلامة",
    "street": "Prince Mohammed Bin Abdulaziz Road",
    "building": "5678",
    "unit": "201",
    "postal_code": "23323",
    "additional_number": "1234",
    "description": "Office building, 2nd floor",
    "is_default": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
  }
}
```

#### Errors | الأخطاء
- **404**: Address not found | العنوان غير موجود
- **403**: Address doesn't belong to customer | العنوان لا ينتمي للعميل
- **422**: Validation errors | أخطاء في البيانات

---

### 5. Delete Address

#### Request | الطلب
```http
DELETE {{base_url}}/store/addresses/:id
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
Authorization: Bearer {{customer_token}}
```

#### URL Parameters | معاملات الرابط
- `id` (integer, required): معرف العنوان | Address ID

#### Description | الوصف
حذف عنوان موجود.

Delete an existing address.

#### Auto-Reassign Default | إعادة تعيين العنوان الافتراضي تلقائياً
إذا تم حذف العنوان الافتراضي وكان لدى العميل عناوين أخرى:
- سيتم تعيين أول عنوان متبقي كعنوان افتراضي تلقائياً

If the default address is deleted and customer has other addresses:
- The first remaining address will be automatically set as default

#### Response | الرد
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

#### Errors | الأخطاء
- **404**: Address not found | العنوان غير موجود
- **403**: Address doesn't belong to customer | العنوان لا ينتمي للعميل

---

# Locations API Documentation

## Locations | المواقع الجغرافية

إدارة البيانات الجغرافية (الدول، المدن، المناطق).

Manage geographical data (countries, cities, districts).

### Features | المميزات

- **Hierarchical Data**: بيانات هرمية (دولة → مدينة → منطقة) | Hierarchical structure (country → city → district)
- **Cached**: محفوظة مؤقتاً لمدة 24 ساعة | Cached for 24 hours
- **Public Access**: لا تحتاج تسجيل دخول | No authentication required
- **Lightweight**: فقط ID والاسم | Only ID and name returned

### Usage Flow | تدفق الاستخدام

1. **Load Countries**: عند فتح نموذج العنوان | When opening address form
2. **Load Cities**: عند اختيار الدولة | When country is selected
3. **Load Districts**: عند اختيار المدينة (اختياري) | When city is selected (optional)

### Caching Strategy | استراتيجية التخزين المؤقت

- **Server-side**: 24 ساعة | 24 hours
- **Client-side**: يُنصح بحفظها في SQLite/Hive | Recommended to store in SQLite/Hive
- **Update**: مرة واحدة يومياً أو عند فتح التطبيق | Once daily or on app launch

### Response Format | تنسيق الرد

جميع الـ endpoints ترجع نفس التنسيق:

All endpoints return the same format:

```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "اسم الموقع"}
  ]
}
```

---

## Endpoints | النقاط الطرفية

### 1. Get Countries

#### Request | الطلب
```http
GET {{base_url}}/store/locations/countries
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
```

#### Description | الوصف
جلب قائمة جميع الدول المتاحة.

Get list of all available countries.

#### Response | الرد
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "المملكة العربية السعودية", "code": "SA", "currency": "SAR"},
    {"id": 2, "name": "الإمارات العربية المتحدة", "code": "AE", "currency": "AED"},
    {"id": 3, "name": "مصر", "code": "EG", "currency": "EGP"}
  ]
}
```

#### Caching | التخزين المؤقت
البيانات محفوظة مؤقتاً لمدة 24 ساعة.

Data is cached for 24 hours.

#### Usage | الاستخدام
استخدم هذا الـ endpoint لملء قائمة الدول في نموذج العنوان.

Use this endpoint to populate country dropdown in address form.

---

### 2. Get Cities

#### Request | الطلب
```http
GET {{base_url}}/store/locations/cities?country_id=1
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
```

#### Query Parameters | معاملات الاستعلام
- `country_id` (integer, **required**): معرف الدولة | Country ID

#### Description | الوصف
جلب قائمة المدن حسب الدولة.

Get list of cities by country.

#### Response | الرد
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "الرياض", "country_id": 1},
    {"id": 2, "name": "جدة", "country_id": 1},
    {"id": 3, "name": "الدمام", "country_id": 1},
    {"id": 4, "name": "مكة المكرمة", "country_id": 1},
    {"id": 5, "name": "المدينة المنورة", "country_id": 1}
  ]
}
```

#### Caching | التخزين المؤقت
البيانات محفوظة مؤقتاً لمدة 24 ساعة لكل دولة.

Data is cached for 24 hours per country.

#### Usage | الاستخدام
استخدم هذا الـ endpoint عند اختيار الدولة لملء قائمة المدن.

Use this endpoint when country is selected to populate cities dropdown.

---

### 3. Get Districts

#### Request | الطلب
```http
GET {{base_url}}/store/locations/districts?city_id=1
```

#### Headers | الرؤوس
```
X-Store-Key: {{store_key}}
Accept: application/json
```

#### Query Parameters | معاملات الاستعلام
- `city_id` (integer, **required**): معرف المدينة | City ID

#### Description | الوصف
جلب قائمة المناطق/الأحياء حسب المدينة.

Get list of districts by city.

#### Response | الرد
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "العليا", "city_id": 1},
    {"id": 2, "name": "الملز", "city_id": 1},
    {"id": 3, "name": "النخيل", "city_id": 1},
    {"id": 4, "name": "اليرموك", "city_id": 1},
    {"id": 5, "name": "الرحمانية", "city_id": 1}
  ]
}
```

#### Caching | التخزين المؤقت
البيانات محفوظة مؤقتاً لمدة 24 ساعة لكل مدينة.

Data is cached for 24 hours per city.

#### Usage | الاستخدام
استخدم هذا الـ endpoint عند اختيار المدينة لملء قائمة المناطق/الأحياء.

Use this endpoint when city is selected to populate districts dropdown.

#### Note | ملاحظة
المناطق اختيارية في نموذج العنوان.

Districts are optional in address form.