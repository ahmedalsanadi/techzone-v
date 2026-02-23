//src/store/useWishlistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiWishlistItem } from '@/types/wishlist';
import { wishlistService } from '@/services/wishlist-service';
import type { ProductMedia } from '@/types/store';

export interface WishlistItem {
    id: string;
    productId: number;
    name: string;
    image: string;
    price: number;
    salePrice: number | null;
    slug: string;
    media?: ProductMedia;
    metadata?: Record<string, unknown>;
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
    tenantHost: string;
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
        media: item.product.media,
        metadata: {
            apiItemId: item.id,
            addedAt: item.added_at,
        },
    };
}

/**
 * Get current host for tenant-aware storage keys
 */
export function getCurrentTenantHostForStorage(): string {
    if (typeof window === 'undefined') return 'server';
    return window.location.host || 'unknown-tenant';
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            isGuestMode: true,
            isLoading: false,
            lastSyncedAt: null,
            tenantHost: getCurrentTenantHostForStorage(),

            addItem: (item) => {
                if (get().isGuestMode) {
                    const currentItems = get().items;
                    const existingItem = currentItems.find(
                        (i) => i.productId === item.productId,
                    );

                    if (!existingItem) {
                        const localId = `local-${Date.now()}-${item.productId}`;
                        set({
                            items: [...currentItems, { ...item, id: localId }],
                        });
                    }
                }
            },
            removeItem: (productId) => {
                if (get().isGuestMode) {
                    set({
                        items: get().items.filter(
                            (i) => i.productId !== productId,
                        ),
                    });
                }
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
                set({ isLoading: true });
                try {
                    const wishlist = await wishlistService.getWishlist();
                    if (wishlist) {
                        get().setWishlistFromAPI(wishlist);
                        set({ lastSyncedAt: Date.now() });
                    } else {
                        set({ items: [] });
                    }
                } catch (error) {
                    console.error('Failed to sync wishlist with API:', error);
                } finally {
                    set({ isLoading: false });
                }
            },
            setGuestMode: (isGuest) => {
                set({
                    isGuestMode: isGuest,
                    ...(isGuest
                        ? { tenantHost: getCurrentTenantHostForStorage() }
                        : {}),
                });
            },
            setWishlistFromAPI: (data) => {
                let itemsArray: ApiWishlistItem[] = [];

                if (Array.isArray(data)) {
                    itemsArray = data;
                } else if (data && typeof data === 'object') {
                    const maybe = data as { data?: unknown; items?: unknown };
                    if (Array.isArray(maybe.data)) {
                        itemsArray = maybe.data as ApiWishlistItem[];
                    } else if (Array.isArray(maybe.items)) {
                        itemsArray = maybe.items as ApiWishlistItem[];
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
                if (get().isGuestMode) {
                    return get().items;
                }
                return [];
            },
        }),
        {
            name: 'fasto-wishlist-storage',
            partialize: (state) => ({
                ...(state.isGuestMode
                    ? { items: state.items, tenantHost: state.tenantHost }
                    : {}),
                isGuestMode: state.isGuestMode,
            }),
            merge: (persisted, current) => {
                const p = persisted as any;
                if (!p) return current;

                const currentHost = getCurrentTenantHostForStorage();
                const isSameHost = p.tenantHost === currentHost;

                return {
                    ...current,
                    ...p,
                    items: isSameHost ? (p.items ?? []) : [],
                    tenantHost: currentHost,
                };
            },
        },
    ),
);
