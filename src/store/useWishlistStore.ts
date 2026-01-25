//src/store/useWishlistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiWishlistItem } from '@/types/wishlist';
import { wishlistService } from '@/services/wishlist-service';

export interface WishlistItem {
    id: string;
    productId: number;
    name: string;
    image: string;
    price: number;
    salePrice: number | null;
    slug: string;
    metadata?: Record<string, any>;
}

interface WishlistStore {
    items: WishlistItem[];
    // API-related state
    isGuestMode: boolean;
    isLoading: boolean;
    lastSyncedAt: number | null;

    // Local wishlist methods (guest mode)
    addItem: (item: Omit<WishlistItem, 'id'>) => void;
    removeItem: (productId: number) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: number) => boolean;
    getTotalItems: () => number;

    // API sync methods (authenticated mode)
    syncWithAPI: () => Promise<void>;
    setGuestMode: (isGuest: boolean) => void;
    setWishlistFromAPI: (items: ApiWishlistItem[]) => void;
    getGuestWishlistItems: () => WishlistItem[];
}

/**
 * Transform API wishlist item to local wishlist item format
 */
function transformApiWishlistItemToLocal(item: ApiWishlistItem): WishlistItem {
    return {
        id: `api-${item.id}`,
        productId: item.product.id,
        name: item.product.title,
        image: item.product.cover_image_url,
        price: item.product.price,
        salePrice: item.product.sale_price,
        slug: item.product.slug,
        metadata: {
            apiItemId: item.id,
            addedAt: item.added_at,
        },
    };
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            isGuestMode: true, // Default to guest mode
            isLoading: false,
            lastSyncedAt: null,

            addItem: (item) => {
                // If in guest mode, use local storage
                if (get().isGuestMode) {
                    const currentItems = get().items;
                    // Check if item already exists
                    const existingItem = currentItems.find(
                        (i) => i.productId === item.productId,
                    );

                    if (!existingItem) {
                        // Generate a local ID
                        const localId = `local-${Date.now()}-${item.productId}`;
                        set({
                            items: [...currentItems, { ...item, id: localId }],
                        });
                    }
                }
                // If authenticated, this should be called via API (handled in useWishlistActions)
            },
            removeItem: (productId) => {
                // If in guest mode, remove from local storage
                if (get().isGuestMode) {
                    set({
                        items: get().items.filter(
                            (i) => i.productId !== productId,
                        ),
                    });
                }
                // If authenticated, this should be called via API (handled in useWishlistActions)
            },
            clearWishlist: () => {
                set({ items: [] });
            },
            isInWishlist: (productId) => {
                return get().items.some((i) => i.productId === productId);
            },
            getTotalItems: () => {
                return get().items.length;
            },
            syncWithAPI: async () => {
                // Determine if we should sync based on auth state
                // This is now more flexible to allow forced syncs
                set({ isLoading: true });
                try {
                    const wishlist = await wishlistService.getWishlist();
                    console.log(
                        '[WishlistStore] Received wishlist from API:',
                        wishlist,
                    );

                    if (wishlist) {
                        get().setWishlistFromAPI(wishlist);
                        set({ lastSyncedAt: Date.now() });
                    } else {
                        console.warn(
                            '[WishlistStore] API returned empty wishlist data',
                        );
                        set({ items: [] });
                    }
                } catch (error) {
                    console.error('Failed to sync wishlist with API:', error);
                    // Don't throw - allow fallback to local state
                } finally {
                    set({ isLoading: false });
                }
            },
            setGuestMode: (isGuest) => {
                set({ isGuestMode: isGuest });
                if (!isGuest) {
                    // When switching to authenticated mode, clear local guest items
                    // They should have been merged already
                    set({ items: [] });
                }
            },
            setWishlistFromAPI: (data) => {
                // Transform API wishlist items to local format
                // Handle cases where data might be the full response object or missing items
                let itemsArray: ApiWishlistItem[] = [];

                if (Array.isArray(data)) {
                    itemsArray = data;
                } else if (data && typeof data === 'object') {
                    // Check if data is wrapped in another object (e.g. { data: [], ... })
                    if (Array.isArray((data as any).data)) {
                        itemsArray = (data as any).data;
                    } else if (Array.isArray((data as any).items)) {
                        itemsArray = (data as any).items;
                    } else {
                        console.error(
                            '[WishlistStore] Expected array in setWishlistFromAPI but got:',
                            data,
                        );
                    }
                }

                const localItems = itemsArray.map(
                    transformApiWishlistItemToLocal,
                );
                set({
                    items: localItems,
                });
            },
            getGuestWishlistItems: () => {
                // Return items only if in guest mode
                if (get().isGuestMode) {
                    return get().items;
                }
                return [];
            },
        }),
        {
            name: 'fasto-wishlist-storage',
            // CRITICAL: Only persist when in guest mode
            // Authenticated users should NOT have wishlist persisted to localStorage
            // Their wishlist is managed by the API
            partialize: (state) => {
                // Only persist if in guest mode
                if (state.isGuestMode) {
                    return {
                        items: state.items,
                        isGuestMode: state.isGuestMode,
                    };
                }
                // Don't persist anything when authenticated
                return {
                    isGuestMode: state.isGuestMode,
                };
            },
        },
    ),
);
