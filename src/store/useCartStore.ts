//src/store/useCartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartService } from '@/services/cart-service';
import type { ApiCart, ApiCartItem } from '@/types/cart';
import { generateCartItemId } from '@/lib/cart/utils';

export type CartItemAddonDetailsGroup = {
    groupName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
};

export type CartItemMetadata = {
    productId?: number;
    productSlug?: string;
    product_variant_id?: number | null;
    variant_options?: Record<string, string>;
    addons?: Record<number, Record<number, number>>;
    addonDetails?: CartItemAddonDetailsGroup[];
    custom_fields?: Record<string, unknown>;
    notes?: string;
    variety?: { name: string };
    [key: string]: unknown;
};

export interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    categoryId: string;
    metadata?: CartItemMetadata;
}

interface CartStore {
    items: CartItem[];
    pendingItems: CartItem[];
    // API-related state
    cartId: number | null;
    isGuestMode: boolean;
    isLoading: boolean;
    lastSyncedAt: number | null;

    // Local cart methods (guest mode)
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;

    // API sync methods (authenticated mode)
    syncWithAPI: () => Promise<void>;
    setGuestMode: (isGuest: boolean) => void;
    setCartFromAPI: (cart: ApiCart) => void;
    getGuestCartItems: () => CartItem[];
    setPendingItems: (items: CartItem[]) => void;
    clearPendingItems: () => void;
    clearPendingByProductId: (productId: number) => void;
}

function transformApiCartItemToLocal(item: ApiCartItem): CartItem {
    // Generate a stable local ID based on the product composition
    const compositeId = generateCartItemId(item.product.id, {
        variantId: item.variant?.id,
        addons: item.addons?.map((a) => ({
            id: a.addon_item_id,
            qty: a.quantity,
        })),
        customFields: item.custom_fields,
        notes: item.notes,
    });
    const localId = `api-${item.id}-${compositeId}`;

    // Transform addons back to local format
    const addons: Record<number, Record<number, number>> = {};
    if (item.addons && item.addons.length > 0) {
        item.addons.forEach((addon) => {
            // We need to reconstruct the group structure
            // Since API doesn't return group_id, we'll store by addon_item_id
            // This is a limitation - we'll need to handle it differently
            // For now, store as a flat structure
            if (!addons[0]) {
                addons[0] = {};
            }
            addons[0][addon.addon_item_id] = addon.quantity;
        });
    }

    // Build addonDetails for display
    const addonDetails: Array<{
        groupName: string;
        items: Array<{ name: string; quantity: number; price: number }>;
    }> = [];

    if (item.addons && item.addons.length > 0) {
        // Group addons by group name
        const grouped = item.addons.reduce(
            (acc, addon) => {
                const groupName = addon.addon_group_name || 'Addons';
                if (!acc[groupName]) {
                    acc[groupName] = [];
                }
                acc[groupName].push({
                    name: addon.addon_item_name,
                    quantity: addon.quantity,
                    price: addon.price,
                });
                return acc;
            },
            {} as Record<
                string,
                Array<{ name: string; quantity: number; price: number }>
            >,
        );

        Object.entries(grouped).forEach(([groupName, items]) => {
            addonDetails.push({ groupName, items });
        });
    }

    return {
        id: localId,
        name: item.product.title,
        image: item.product.cover_image_url,
        price:
            item.quantity > 0
                ? item.total_price / item.quantity
                : item.unit_price,
        quantity: item.quantity,
        categoryId: String(item.product.categories?.[0]?.id || item.product.id),
        metadata: {
            productId: item.product.id,
            productSlug: item.product.slug,
            apiItemId: item.id, // Store API item ID for updates/deletes
            addons,
            addonDetails,
            notes: item.notes || undefined,
            custom_fields: item.custom_fields || undefined,
            variant_options: item.variant_options || undefined,
            product_variant_id: item.variant?.id || undefined,
            variety: item.variant ? { name: item.variant.title } : undefined,
        },
    };
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            pendingItems: [],
            cartId: null,
            isGuestMode: true, // Default to guest mode
            isLoading: false,
            lastSyncedAt: null,

            addItem: (item, quantity = 1) => {
                // If in guest mode, use local storage
                if (get().isGuestMode) {
                    const currentItems = get().items;
                    const existingItem = currentItems.find(
                        (i) => i.id === item.id,
                    );

                    if (existingItem) {
                        set({
                            items: currentItems.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i,
                            ),
                        });
                    } else {
                        set({
                            items: [...currentItems, { ...item, quantity }],
                        });
                    }
                }
                // If authenticated, this should be called via API (handled in useCartActions)
            },
            removeItem: (id) => {
                // If in guest mode, remove from local storage
                if (get().isGuestMode) {
                    set({
                        items: get().items.filter((i) => i.id !== id),
                    });
                }
                // If authenticated, this should be called via API (handled in useCartActions)
            },
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                // If in guest mode, update locally
                if (get().isGuestMode) {
                    set({
                        items: get().items.map((i) =>
                            i.id === id ? { ...i, quantity } : i,
                        ),
                    });
                }
                // If authenticated, this should be called via API (handled in useCartActions)
            },
            clearCart: () => {
                set({ items: [], cartId: null });
            },
            getTotalItems: () => {
                return get().items.reduce(
                    (total, item) => total + item.quantity,
                    0,
                );
            },
            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0,
                );
            },
            syncWithAPI: async () => {
                // CRITICAL: Only sync if authenticated and not in guest mode
                // This prevents API calls when user is not authenticated
                if (get().isGuestMode) {
                    return; // Don't sync if in guest mode
                }

                // Additional guard: Check if we're in a browser environment
                // and verify authentication state (can't import useAuthStore here due to circular deps)
                // The calling code should check authentication before calling this

                // Guard: Avoid redundant syncs if one happened recently (e.g., during merge)
                const lastSynced = get().lastSyncedAt;
                if (lastSynced && Date.now() - lastSynced < 2000) {
                    return;
                }

                set({ isLoading: true });
                try {
                    const cart = await cartService.getCart();
                    get().setCartFromAPI(cart);
                    set({ lastSyncedAt: Date.now() });
                } catch (error) {
                    console.error('Failed to sync cart with API:', error);
                    // Don't throw - allow fallback to local state
                } finally {
                    set({ isLoading: false });
                }
            },
            setGuestMode: (isGuest) => {
                set({ isGuestMode: isGuest });
            },
            setCartFromAPI: (cart) => {
                // Transform API cart items to local format
                const localItems = cart.items.map(transformApiCartItemToLocal);
                set({
                    items: localItems,
                    cartId: cart.id,
                });
            },
            getGuestCartItems: () => {
                // Return items only if in guest mode
                if (get().isGuestMode) {
                    return get().items;
                }
                return [];
            },
            setPendingItems: (items) => {
                set({ pendingItems: items });
            },
            clearPendingItems: () => {
                set({ pendingItems: [] });
            },
            clearPendingByProductId: (productId) => {
                set({
                    pendingItems: get().pendingItems.filter(
                        (item) => item.metadata?.productId !== productId,
                    ),
                });
            },
        }),
        {
            name: 'fasto-cart-storage',
            // CRITICAL: Only persist when in guest mode
            // Authenticated users should NOT have cart persisted to localStorage
            // Their cart is managed by the API
            partialize: (state) => ({
                ...(state.isGuestMode ? { items: state.items } : {}),
                pendingItems: state.pendingItems,
                isGuestMode: state.isGuestMode,
            }),
        },
    ),
);
