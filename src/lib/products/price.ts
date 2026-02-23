import type { Product, ProductVariant } from '@/types/store';

/**
 * Resolve the effective price for display and calculations.
 * - Uses sale_price when available (product or variant).
 * - When product has a discount but the selected variant has no sale_price,
 *   applies the product's discount ratio to the variant price so all sizes
 *   reflect the sale (e.g. product 45→40.5, variant 50→45).
 */
export function getEffectivePrice(
    product: Product,
    variant?: ProductVariant | null,
): number {
    if (variant) {
        if (variant.sale_price != null && variant.sale_price > 0) {
            return Number(variant.sale_price);
        }
        if (
            product.has_discount &&
            product.sale_price != null &&
            product.price > 0
        ) {
            const ratio = product.sale_price / product.price;
            return Number(variant.price * ratio);
        }
        return Number(variant.price);
    }
    return Number(product.sale_price ?? product.price);
}

/**
 * Effective price plus original price when a discount is applied (for strikethrough).
 */
export function getEffectivePriceWithOriginal(
    product: Product,
    variant?: ProductVariant | null,
): { price: number; originalPrice: number | undefined } {
    const price = getEffectivePrice(product, variant);
    if (variant) {
        const originalPrice =
            price < Number(variant.price) ? Number(variant.price) : undefined;
        return { price, originalPrice };
    }
    const originalPrice =
        product.has_discount && product.sale_price != null
            ? Number(product.price)
            : undefined;
    return { price, originalPrice };
}

/**
 * For product cards and lists: display price and optional original price (strikethrough).
 */
export function getProductDisplayPrice(product: Product): {
    price: number;
    originalPrice: number | undefined;
    discountPercent: number | undefined;
} {
    const salePrice = product.sale_price;
    const price = Number(salePrice ?? product.price);
    const hasDiscount =
        product.has_discount && salePrice != null && salePrice < product.price;

    const originalPrice = hasDiscount ? Number(product.price) : undefined;
    const discountPercent = hasDiscount
        ? Math.round(
              ((Number(product.price) - Number(salePrice)) /
                  Number(product.price)) *
                  100,
          )
        : undefined;

    return { price, originalPrice, discountPercent };
}
