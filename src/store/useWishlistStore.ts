//src/store/useWishlistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiWishlistItem } from '@/types/wishlist';
import { wishlistService } from '@/services/wishlist-service';
import { storeService } from '@/services/store-service';
import { ApiError } from '@/lib/api/client';
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

    // Validation
    purgeDeletedItems: () => Promise<void>;

    // API sync methods (authenticated mode)
    syncWithAPI: () => Promise<void>;
    setGuestMode: (isGuest: boolean) => void;
    setWishlistFromAPI: (items: ApiWishlistItem[]) => void;
    getGuestWishlistItems: () => WishlistItem[];
    tenantHost: string;
}

/**
 * Normalize wishlist payload from GET /store/wishlist — `data` may be a bare array
 * or wrapped ({ data: [] } / { items: [] }) depending on the API.
 */
function normalizeApiWishlistItems(data: unknown): ApiWishlistItem[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object') {
        const maybe = data as { data?: unknown; items?: unknown };
        if (Array.isArray(maybe.data)) {
            return maybe.data as ApiWishlistItem[];
        }
        if (Array.isArray(maybe.items)) {
            return maybe.items as ApiWishlistItem[];
        }
    }
    return [];
}

/**
 * Transform API wishlist item to local wishlist item format
 */
function transformApiWishlistItemToLocal(
    item: ApiWishlistItem,
): WishlistItem | null {
    if (!item.product) return null;

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
            purgeDeletedItems: async () => {
                const snapshot = get().items;
                if (snapshot.length === 0) return;

                const checks = await Promise.allSettled(
                    snapshot.map((item) =>
                        storeService.getProduct(item.slug).then(
                            () => ({ productId: item.productId, deleted: false }),
                            (err: unknown) => ({
                                productId: item.productId,
                                deleted: err instanceof ApiError && err.status === 404,
                            }),
                        ),
                    ),
                );

                const deletedIds = new Set(
                    checks
                        .filter(
                            (r): r is PromiseFulfilledResult<{ productId: number; deleted: boolean }> =>
                                r.status === 'fulfilled' && r.value.deleted,
                        )
                        .map((r) => r.value.productId),
                );

                if (deletedIds.size > 0) {
                    set({
                        items: get().items.filter(
                            (item) => !deletedIds.has(item.productId),
                        ),
                    });
                }
            },
            syncWithAPI: async () => {
                set({ isLoading: true });
                try {
                    const raw = await wishlistService.getWishlist();
                    if (raw != null) {
                        const normalized = normalizeApiWishlistItems(raw);
                        const orphanedItems = normalized.filter(
                            (item) => !item.product,
                        );

                        get().setWishlistFromAPI(raw);
                        set({ lastSyncedAt: Date.now() });

                        if (orphanedItems.length > 0) {
                            void Promise.allSettled(
                                orphanedItems.map((item) =>
                                    wishlistService.removeItem(item.id),
                                ),
                            ).catch(() => {});
                        }
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
                const itemsArray = normalizeApiWishlistItems(data);

                const localItems = itemsArray
                    .map(transformApiWishlistItemToLocal)
                    .filter((item): item is WishlistItem => item !== null);
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
