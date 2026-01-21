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

            // Merge guest wishlist with customer wishlist
            // API will handle duplicates (won't add if already exists)
            await wishlistService.mergeGuestWishlist(productIds);

            // Sync wishlist with API to get updated state (includes merged items)
            await syncWithAPI();

            // Clear local guest wishlist items
            clearWishlist();

            // Switch to authenticated mode
            setGuestMode(false);
        } catch (error) {
            // If merge fails, log error but don't block auth flow
            // Try to sync with API anyway to get customer's existing wishlist
            console.error('Failed to merge guest wishlist:', error);
            try {
                await syncWithAPI();
                setGuestMode(false);
            } catch (syncError) {
                console.error(
                    'Failed to sync wishlist after merge failure:',
                    syncError,
                );
                // Keep guest mode if sync also fails
            }
        }
    }, [
        getGuestWishlistItems,
        syncWithAPI,
        clearWishlist,
        setGuestMode,
    ]);

    return { mergeGuestWishlistAfterAuth };
}
