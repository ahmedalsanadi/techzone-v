# Cart addons pricing: `multiply_price_by_quantity`

## Backend contract (correct)

The backend is the source of truth. Addon pricing respects **`multiply_price_by_quantity`**:

- **`true`** → Addon cost **scales with product quantity** (per unit).  
  Example: 2× extra cheese (price 3) for quantity 2 → 2 × (3×2) = 12.

- **`false`** → Addon is **flat per line** (charged once, do not scale with quantity).  
  Example: 1× BBQ sauce (2) + 1× brioche (3) for quantity 2 → addons_price = 5, total = 90 + 5 = 95.

So for a request with quantity 2 and addons that have `multiply_price_by_quantity: false`, the API correctly returns `addons_price = 5` and `total_price = 95`.

---

## Frontend behavior

The frontend **respects** `multiply_price_by_quantity` everywhere:

1. **ProductDetails** – `calculateTotalPrice()`  
   - `multiply_price_by_quantity === true` → addon total += (extra_price × addon qty) × product quantity.  
   - `multiply_price_by_quantity === false` → addon total += (extra_price × addon qty) once.

2. **CartItemConfigModal** – same rule when recalculating total in the edit modal.

3. **ProductConfigModal** – addon total for quantity 1 (no scaling).

4. **useCartActions** – `computeApiAddonsPrice()`  
   - Used for optimistic updates when quantity changes.  
   - `multiply_by_quantity === true` → addon contribution × productQty.  
   - `multiply_by_quantity === false` → addon contribution once.

Displayed totals and stored cart totals therefore match the API.

---

## User-facing hint

So customers understand why some addons don’t double when they increase quantity, the UI shows a short label for addons with `multiply_price_by_quantity: false`:

- **EN:** “(once per order)” next to the addon price  
- **AR:** “(مرة واحدة للطلب)” next to the addon price  

Addons with `multiply_price_by_quantity: true` keep the existing “(per quantity)” / “(لكل كمية)” label.  
Translation keys: `Product.addonFixedPrice`, `Product.perQuantity`.
