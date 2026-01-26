/**
 * Hook for merging guest wishlist with customer wishlist after authentication
 */

import { useCallback } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { wishlistService } from '@/services/wishlist-service';
import { extractProductIdsFromWishlist } from '@/lib/wishlist/transform';

export function useWishlistMerge() {
    const {
        getGuestWishlistItems,
        setGuestMode,
        setWishlistFromAPI,
        clearWishlist,
        syncWithAPI,
    } = useWishlistStore();

    const mergeGuestWishlistAfterAuth = useCallback(async () => {
        try {
            // Get guest wishlist items (only if in guest mode)
            const guestItems = getGuestWishlistItems();

            if (guestItems.length === 0) {
                // No guest items to merge, just sync with API
                await syncWithAPI();
                return;
            }

            // Extract product IDs from guest wishlist items
            const productIds = extractProductIdsFromWishlist(guestItems);

            if (productIds.length === 0) {
                // No valid items to merge, just sync with API
                await syncWithAPI();
                return;
            }

            // 1. Switch to authenticated mode FIRST
            setGuestMode(false);

            // 2. Merge guest wishlist with customer wishlist
            await wishlistService.mergeGuestWishlist(productIds);

            // 3. Then sync wishlist with API to get updated state (includes merged items)
            await syncWithAPI();
        } catch (error) {
            try {
                setGuestMode(false);
                await syncWithAPI();
            } catch (syncError) {
                console.error(
                    'Failed to sync wishlist after merge failure:',
                    syncError,
                );
            }
        }
    }, [getGuestWishlistItems, syncWithAPI, clearWishlist, setGuestMode]);

    return { mergeGuestWishlistAfterAuth };
}
