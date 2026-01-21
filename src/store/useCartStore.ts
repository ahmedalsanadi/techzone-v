//src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiCart, ApiCartItem } from '@/types/cart';
import { cartService } from '@/services/cart-service';

export interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    categoryId: string;
    metadata?: Record<string, any>;
}

interface CartStore {
    items: CartItem[];
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
}

/**
 * Transform API cart item to local cart item format
 */
function transformApiCartItemToLocal(item: ApiCartItem): CartItem {
    // Use API item ID as the local ID
    const localId = `api-${item.id}`;

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
        const grouped = item.addons.reduce((acc, addon) => {
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
        }, {} as Record<string, Array<{ name: string; quantity: number; price: number }>>);

        Object.entries(grouped).forEach(([groupName, items]) => {
            addonDetails.push({ groupName, items });
        });
    }

    return {
        id: localId,
        name: item.product.title,
        image: item.product.cover_image_url,
        price: item.unit_price,
        quantity: item.quantity,
        categoryId: item.product.id.toString(),
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
        },
    };
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            cartId: null,
            isGuestMode: true, // Default to guest mode
            isLoading: false,
            lastSyncedAt: null,

            addItem: (item, quantity = 1) => {
                // If in guest mode, use local storage
                if (get().isGuestMode) {
                    const currentItems = get().items;
                    const existingItem = currentItems.find((i) => i.id === item.id);

                    if (existingItem) {
                        set({
                            items: currentItems.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i,
                            ),
                        });
                    } else {
                        set({ items: [...currentItems, { ...item, quantity }] });
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
                if (!isGuest) {
                    // When switching to authenticated mode, clear local guest items
                    // They should have been merged already
                    set({ items: [] });
                }
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
        }),
        {
            name: 'fasto-cart-storage',
            // CRITICAL: Only persist when in guest mode
            // Authenticated users should NOT have cart persisted to localStorage
            // Their cart is managed by the API
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
