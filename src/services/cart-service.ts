import { fetchLibero } from './api';
import type {
    ApiCart,
    AddCartItemRequest,
    UpdateCartItemRequest,
    MergeGuestCartRequest,
    CartValidationResponse,
    ApiCartItem,
} from '@/types/cart';

/**
 * Service for cart-related API operations
 */
export const cartService = {
    /**
     * Get the customer's cart (works for both guest and authenticated users)
     * GET /store/cart
     */
    getCart: () =>
        fetchLibero<ApiCart>('/store/cart', {
            isProtected: true,
            // Don't cache cart data
            next: { revalidate: 0 },
        }),

    /**
     * Add item to cart
     * POST /store/cart/items
     * Works for both guest and authenticated users (optional auth)
     */
    addItem: (data: AddCartItemRequest) =>
        fetchLibero<ApiCartItem>('/store/cart/items', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true, // Send token if available (optional auth)
            next: { revalidate: 0 },
        }),

    /**
     * Update cart item
     * PATCH /store/cart/items/{id}
     * Works for both guest and authenticated users (optional auth)
     */
    updateItem: (itemId: number, data: UpdateCartItemRequest) =>
        fetchLibero<ApiCartItem>(`/store/cart/items/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            isProtected: true, // Send token if available (optional auth)
            next: { revalidate: 0 },
        }),

    /**
     * Remove item from cart
     * DELETE /store/cart/items/{id}
     * Works for both guest and authenticated users (optional auth)
     */
    removeItem: (itemId: number) =>
        fetchLibero<null>(`/store/cart/items/${itemId}`, {
            method: 'DELETE',
            isProtected: true, // Send token if available (optional auth)
            next: { revalidate: 0 },
        }),

    /**
     * Clear entire cart
     * DELETE /store/cart
     * Works for both guest and authenticated users (optional auth)
     */
    clearCart: () =>
        fetchLibero<null>('/store/cart', {
            method: 'DELETE',
            isProtected: true, // Send token if available (optional auth)
            next: { revalidate: 0 },
        }),

    /**
     * Merge guest cart with customer cart after login
     * POST /store/cart/merge
     * Requires authentication
     */
    mergeGuestCart: (data: MergeGuestCartRequest) =>
        fetchLibero<ApiCart>('/store/cart/merge', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
            next: { revalidate: 0 },
        }),

    /**
     * Validate cart before checkout
     * POST /store/cart/validate
     * Works for both guest and authenticated users (optional auth)
     */
    validateCart: () =>
        fetchLibero<CartValidationResponse>('/store/cart/validate', {
            method: 'POST',
            isProtected: true, // Send token if available (optional auth)
            next: { revalidate: 0 },
        }),
};
