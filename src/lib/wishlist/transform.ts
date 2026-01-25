/**
 * Utilities for transforming between local wishlist format and API format
 */

import type { WishlistItem } from '@/store/useWishlistStore';
import type { GuestWishlistItem } from '@/types/wishlist';

/**
 * Transform local wishlist item to API guest wishlist item format for merge
 */
export function transformLocalWishlistItemToGuestItem(
    item: WishlistItem,
): GuestWishlistItem | null {
    // Extract product_id
    const productId = item.productId;
    if (!productId || typeof productId !== 'number') {
        console.warn('Wishlist item missing productId:', item);
        return null;
    }

    return {
        product_id: productId,
    };
}

/**
 * Transform array of local wishlist items to guest wishlist items for merge
 * Filters out invalid items
 */
export function transformLocalWishlistToGuestWishlist(
    items: WishlistItem[],
): GuestWishlistItem[] {
    return items
        .map(transformLocalWishlistItemToGuestItem)
        .filter((item): item is GuestWishlistItem => item !== null);
}

/**
 * Extract product IDs from local wishlist items for merge
 */
export function extractProductIdsFromWishlist(
    items: WishlistItem[],
): number[] {
    return items
        .map((item) => item.productId)
        .filter((id): id is number => typeof id === 'number' && id > 0);
}
