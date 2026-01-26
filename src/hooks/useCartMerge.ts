/**
 * Hook for merging guest cart with customer cart after authentication
 */

import { useCallback } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { cartService } from '@/services/cart-service';
import { transformLocalCartToGuestCart } from '@/lib/cart/transform';

export function useCartMerge() {
    const {
        getGuestCartItems,
        setGuestMode,
        setCartFromAPI,
        clearCart,
        syncWithAPI,
    } = useCartStore();

    const mergeGuestCartAfterAuth = useCallback(async () => {
        try {
            // Get guest cart items (only if in guest mode)
            const guestItems = getGuestCartItems();

            if (guestItems.length === 0) {
                // No guest items to merge, just sync with API
                await syncWithAPI();
                return;
            }

            // Transform guest cart items to API format
            const guestCartItems = transformLocalCartToGuestCart(guestItems);

            if (guestCartItems.length === 0) {
                // No valid items to merge, just sync with API
                await syncWithAPI();
                return;
            }

            // 1. Switch to authenticated mode FIRST
            // This prevents the store from treating future updates as guest actions
            setGuestMode(false);

            // 2. Merge guest cart with customer cart
            const mergedCart = await cartService.mergeGuestCart({
                guest_cart: guestCartItems,
            });

            // 3. Update cart store with merged cart
            setCartFromAPI(mergedCart);
        } catch (error) {
            // If merge fails, log error but don't block auth flow
            // Try to sync with API anyway to get customer's existing cart
            console.error('Failed to merge guest cart:', error);
            try {
                await syncWithAPI();
                setGuestMode(false);
            } catch (syncError) {
                console.error(
                    'Failed to sync cart after merge failure:',
                    syncError,
                );
                // Keep guest mode if sync also fails
            }
        }
    }, [
        getGuestCartItems,
        syncWithAPI,
        setCartFromAPI,
        clearCart,
        setGuestMode,
    ]);

    return { mergeGuestCartAfterAuth };
}
