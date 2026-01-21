/**
 * Utilities for transforming between local cart format and API format
 */

import type { CartItem } from '@/store/useCartStore';
import type { GuestCartItem, AddCartAddon } from '@/types/cart';

/**
 * Transform local cart item to API guest cart item format for merge
 */
export function transformLocalCartItemToGuestCartItem(
    item: CartItem,
): GuestCartItem | null {
    // Extract product_id from metadata
    const productId = item.metadata?.productId;
    if (!productId || typeof productId !== 'number') {
        console.warn('Cart item missing productId in metadata:', item);
        return null;
    }

    // Transform addons from Record<groupId, Record<itemId, quantity>> to API format
    const addons: AddCartAddon[] = [];
    const localAddons = item.metadata?.addons;
    
    if (localAddons && typeof localAddons === 'object') {
        Object.entries(localAddons).forEach(([groupId, items]) => {
            if (items && typeof items === 'object') {
                Object.entries(items).forEach(([itemId, quantity]) => {
                    const qty = typeof quantity === 'number' ? quantity : 0;
                    if (qty > 0) {
                        addons.push({
                            addon_item_id: parseInt(itemId, 10),
                            quantity: qty,
                        });
                    }
                });
            }
        });
    }

    // Build the guest cart item
    const guestItem: GuestCartItem = {
        product_id: productId,
        quantity: item.quantity,
    };

    // Add optional fields if they exist
    if (addons.length > 0) {
        guestItem.addons = addons;
    }

    if (item.metadata?.notes) {
        guestItem.notes = item.metadata.notes;
    }

    // Add custom_fields if any exist (currently not used but API supports it)
    if (item.metadata?.custom_fields) {
        guestItem.custom_fields = item.metadata.custom_fields;
    }

    // Add variant_options if any exist (currently not used but API supports it)
    if (item.metadata?.variant_options) {
        guestItem.variant_options = item.metadata.variant_options;
    }

    // Add product_variant_id if exists
    if (item.metadata?.product_variant_id) {
        guestItem.product_variant_id = item.metadata.product_variant_id;
    }

    return guestItem;
}

/**
 * Transform array of local cart items to guest cart items for merge
 * Filters out invalid items
 */
export function transformLocalCartToGuestCart(
    items: CartItem[],
): GuestCartItem[] {
    return items
        .map(transformLocalCartItemToGuestCartItem)
        .filter((item): item is GuestCartItem => item !== null);
}
