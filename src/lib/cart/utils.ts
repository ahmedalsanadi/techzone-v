/**
 * Cart utility functions
 */

import type { CartItem } from '@/store/useCartStore';
import type { AddCartAddon, AddCartItemRequest } from '@/types/cart';

/**
 * Transform local cart item to API request format
 */
export function transformCartItemToApiRequest(
    item: Omit<CartItem, 'quantity'>,
    quantity: number = 1,
): AddCartItemRequest {
    // Extract product_id from metadata
    const productId = item.metadata?.productId;
    if (!productId || typeof productId !== 'number') {
        throw new Error('Product ID is required');
    }

    // Transform addons to API format
    const addons: AddCartAddon[] = [];
    const localAddons = item.metadata?.addons;

    if (localAddons && typeof localAddons === 'object') {
        Object.entries(localAddons).forEach(([groupId, items]) => {
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
    }

    // Build API request
    const apiRequest: AddCartItemRequest = {
        product_id: productId,
        quantity,
    };

    // Add optional fields
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
