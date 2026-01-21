import { fetchLibero } from './api';
import type {
    ApiWishlistItem,
    AddWishlistItemRequest,
    ToggleWishlistResponse,
    CheckWishlistResponse,
} from '@/types/wishlist';

/**
 * Service for wishlist-related API operations
 * All wishlist endpoints require authentication
 */
export const wishlistService = {
    /**
     * Get the customer's wishlist
     * GET /store/wishlist
     * Requires authentication
     */
    getWishlist: () =>
        fetchLibero<ApiWishlistItem[]>('/store/wishlist', {
            isProtected: true,
            // Don't cache wishlist data
            next: { revalidate: 0 },
        }),

    /**
     * Add product to wishlist
     * POST /store/wishlist
     * Requires authentication
     */
    addItem: (data: AddWishlistItemRequest) =>
        fetchLibero<ApiWishlistItem>('/store/wishlist', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
            next: { revalidate: 0 },
        }),

    /**
     * Remove product from wishlist
     * DELETE /store/wishlist/{productId}
     * Requires authentication
     */
    removeItem: (productId: number) =>
        fetchLibero<null>(`/store/wishlist/${productId}`, {
            method: 'DELETE',
            isProtected: true,
            next: { revalidate: 0 },
        }),

    /**
     * Toggle product in wishlist (add if not exists, remove if exists)
     * POST /store/wishlist/{productId}/toggle
     * Requires authentication
     */
    toggleItem: (productId: number) =>
        fetchLibero<ToggleWishlistResponse>(
            `/store/wishlist/${productId}/toggle`,
            {
                method: 'POST',
                isProtected: true,
                next: { revalidate: 0 },
            },
        ),

    /**
     * Check if product is in wishlist
     * GET /store/wishlist/check/{productId}
     * Requires authentication
     */
    checkItem: (productId: number) =>
        fetchLibero<CheckWishlistResponse>(
            `/store/wishlist/check/${productId}`,
            {
                isProtected: true,
                next: { revalidate: 0 },
            },
        ),

    /**
     * Clear entire wishlist
     * DELETE /store/wishlist
     * Requires authentication
     */
    clearWishlist: () =>
        fetchLibero<null>('/store/wishlist', {
            method: 'DELETE',
            isProtected: true,
            next: { revalidate: 0 },
        }),

    /**
     * Merge guest wishlist with customer wishlist after login
     * POST /store/wishlist/merge (if exists) or add items individually
     * Note: API doesn't have a merge endpoint, so we'll add items individually
     * Requires authentication
     */
    mergeGuestWishlist: async (productIds: number[]) => {
        // Since API doesn't have a merge endpoint, we add items individually
        // The API will handle duplicates (won't add if already exists)
        const results = await Promise.allSettled(
            productIds.map((productId) =>
                wishlistService.addItem({ product_id: productId }),
            ),
        );
        // Return successful additions
        return results
            .filter((r) => r.status === 'fulfilled')
            .map((r) => (r as PromiseFulfilledResult<ApiWishlistItem>).value);
    },
};
