import type { CartItem } from '@/store/useCartStore';
import type { AddCartAddon, AddCartItemRequest } from '@/types/cart';

/**
 * Generate a stable local ID for a cart item based on its configuration.
 * This ensures that items with the same product, variant, addons, and custom fields
 * are merged together in the guest cart.
 */
export function generateCartItemId(
    productId: number,
    composition: {
        variantId?: number | null;
        addons?:
            | Array<{ id: number; qty: number }>
            | Record<number, Record<number, number>>
            | null;
        customFields?: Record<string, any> | null;
        notes?: string | null;
    },
): string {
    const parts = [productId.toString()];

    if (composition.variantId) {
        parts.push(`v${composition.variantId}`);
    }

    if (composition.addons) {
        const addonParts: string[] = [];

        if (Array.isArray(composition.addons)) {
            // Case 1: Array of {id, qty} (from API sync)
            composition.addons.forEach((a) => {
                if (a.qty > 0) addonParts.push(`${a.id}:${a.qty}`);
            });
        } else {
            // Case 2: Record<groupId, Record<itemId, quantity>> (from detail page)
            Object.values(composition.addons).forEach((groupItems) => {
                Object.entries(groupItems).forEach(([itemId, qty]) => {
                    if (qty > 0) addonParts.push(`${itemId}:${qty}`);
                });
            });
        }

        if (addonParts.length > 0) {
            // Sort to ensure stable ID
            parts.push(`a[${addonParts.sort().join(',')}]`);
        }
    }

    if (
        composition.customFields &&
        Object.keys(composition.customFields).length > 0
    ) {
        const sortedFields = Object.keys(composition.customFields).sort();
        const fieldParts = sortedFields.map(
            (k) => `${k}:${JSON.stringify(composition.customFields![k])}`,
        );
        parts.push(`c[${fieldParts.join(',')}]`);
    }

    if (composition.notes?.trim()) {
        parts.push(`n:${composition.notes.trim()}`);
    }

    return parts.join('-');
}

/**
 * Transform local addons record to API format
 */
export function transformLocalAddonsToApi(
    localAddons?: Record<number, Record<number, number>> | null,
): AddCartAddon[] {
    const addons: AddCartAddon[] = [];
    if (!localAddons || typeof localAddons !== 'object') return addons;

    Object.entries(localAddons).forEach(([_, items]) => {
        if (items && typeof items === 'object') {
            Object.entries(items).forEach(([itemId, qty]) => {
                const addonQty = typeof qty === 'number' ? qty : 0;
                if (addonQty > 0) {
                    addons.push({
                        addon_item_id: parseInt(itemId, 10),
                        quantity: addonQty,
                    });
                }
            });
        }
    });

    return addons;
}

/**
 * Transform local cart item to API request format
 */
export function transformCartItemToApiRequest(
    item: Omit<CartItem, 'quantity'>,
    quantity: number = 1,
): AddCartItemRequest {
    const productId = item.metadata?.productId;
    if (!productId || typeof productId !== 'number') {
        throw new Error('Product ID is required');
    }

    const apiRequest: AddCartItemRequest = {
        product_id: productId,
        quantity,
    };

    // Use unified addon transformation
    const addons = transformLocalAddonsToApi(item.metadata?.addons);
    if (addons.length > 0) {
        apiRequest.addons = addons;
    }

    if (item.metadata?.product_variant_id) {
        apiRequest.product_variant_id = item.metadata.product_variant_id;
    }

    if (item.metadata?.notes) {
        apiRequest.notes = item.metadata.notes;
    }

    if (item.metadata?.custom_fields) {
        apiRequest.custom_fields = item.metadata.custom_fields;
    }

    if (item.metadata?.variant_options) {
        apiRequest.variant_options = item.metadata.variant_options;
    }

    return apiRequest;
}
