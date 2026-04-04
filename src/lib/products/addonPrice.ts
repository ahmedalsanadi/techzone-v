import type { Product } from '@/types/store';

/**
 * Monetary contribution of one addon item selection.
 *
 * `multiply_price_by_quantity` on the product API means: multiply `extra_price`
 * by the **addon item quantity**. When false, the add-on is a flat fee for the
 * selection (any qty > 0 pays `extra_price` once).
 *
 * This must not use the cart line / product quantity here — that is applied only
 * to the base product unit price.
 */
export function addonLineContribution(
    extraPrice: number,
    addonItemQty: number,
    multiplyPriceByAddonQuantity: boolean,
): number {
    if (addonItemQty <= 0) return 0;
    return multiplyPriceByAddonQuantity
        ? extraPrice * addonItemQty
        : extraPrice;
}

export function sumAddonSubtotalForProductSelection(
    product: Product,
    selectedAddons: Record<number, Record<number, number>>,
): number {
    let total = 0;
    for (const [groupIdStr, groupSelection] of Object.entries(selectedAddons)) {
        const groupId = parseInt(groupIdStr, 10);
        if (!Number.isFinite(groupId)) continue;
        const group = product.addons?.find((g) => g.id === groupId);
        if (!group) continue;
        for (const [itemIdStr, qty] of Object.entries(groupSelection)) {
            const itemId = parseInt(itemIdStr, 10);
            if (!Number.isFinite(itemId) || qty <= 0) continue;
            const item = group.items.find((i) => i.id === itemId);
            if (!item) continue;
            total += addonLineContribution(
                item.extra_price,
                qty,
                item.multiply_price_by_quantity,
            );
        }
    }
    return total;
}

/** Same as {@link sumAddonSubtotalForProductSelection} but keyed by addon item id (e.g. cart edit modal). */
export function sumAddonSubtotalFromFlatItemQty(
    product: Product,
    itemIdToQty: Record<number, number>,
): number {
    let total = 0;
    for (const group of product.addons || []) {
        for (const item of group.items) {
            const qty = itemIdToQty[item.id] || 0;
            if (qty <= 0) continue;
            total += addonLineContribution(
                item.extra_price,
                qty,
                item.multiply_price_by_quantity,
            );
        }
    }
    return total;
}
