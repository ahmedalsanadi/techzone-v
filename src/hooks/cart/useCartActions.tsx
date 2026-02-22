// src/hooks/useCartActions.tsx
'use client';

import { useTranslations } from 'next-intl';
import {
    useCartStore,
    CartItem,
    transformApiCartItemToLocal,
} from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cartService } from '@/services/cart-service';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import React from 'react';
import { useRouter } from '@/i18n/navigation';
import {
    transformCartItemToApiRequest,
    transformLocalAddonsToApi,
} from '@/lib/cart/utils';

type PendingQty = {
    desiredQuantity: number;
    timer: ReturnType<typeof setTimeout> | null;
    apiItemId: number;
};

function computeApiAddonsPrice(
    addons:
        | Array<{
              quantity: number;
              price: number;
              multiply_by_quantity: boolean;
          }>
        | undefined,
    productQty: number,
): number {
    if (!addons || addons.length === 0) return 0;
    // Respect multiply_by_quantity from API: when true, scale with product qty; when false, flat per line.
    return addons.reduce((sum, a) => {
        const base = (a.price || 0) * (a.quantity || 0);
        return sum + (a.multiply_by_quantity ? base * productQty : base);
    }, 0);
}

const pendingQtyByLocalId = new Map<string, PendingQty>();
const pendingQtyMutations = new Set<string>();

export const useCartActions = () => {
    const addItem = useCartStore((state) => state.addItem);
    const syncWithAPI = useCartStore((state) => state.syncWithAPI);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const isGuestMode = useCartStore((state) => state.isGuestMode);
    const beginMutation = useCartStore((state) => state.beginMutation);
    const endMutation = useCartStore((state) => state.endMutation);
    const clearPendingByProductId = useCartStore(
        (state) => state.clearPendingByProductId,
    );
    const { isAuthenticated } = useAuthStore();
    const t = useTranslations('Cart');
    const router = useRouter();

    const addToCart = async (
        item: Omit<CartItem, 'quantity'>,
        quantity: number = 1,
    ) => {
        // CRITICAL: Only use API if authenticated
        // Guest users should only use local storage (no API calls)
        if (isAuthenticated && !isGuestMode) {
            beginMutation();
            try {
                // Extract product_id from metadata
                const productId = item.metadata?.productId;
                if (!productId || typeof productId !== 'number') {
                    throw new Error('Product ID is required');
                }

                const apiRequest = transformCartItemToApiRequest(
                    item,
                    quantity,
                );

                // Add item via API, then update local store from returned item (avoid full refetch)
                const apiItem = await cartService.addItem(apiRequest);
                const localItem = transformApiCartItemToLocal(apiItem);
                useCartStore.setState((s) => {
                    const without = s.items.filter(
                        (i) => i.metadata?.apiItemId !== apiItem.id,
                    );
                    return { items: [...without, localItem] };
                });

                clearPendingByProductId(productId);

                toast.success(t('added'), {
                    icon: (
                        <ShoppingCart
                            size={18}
                            className="text-theme-primary"
                        />
                    ),

                    action: {
                        label: t('viewCart'),
                        onClick: () => router.push('/cart'),
                    },
                });
            } catch (error) {
                console.error('Failed to add item to cart via API:', error);
                toast.error(t('addError') || 'فشل إضافة المنتج إلى السلة');
            } finally {
                endMutation();
            }
        } else {
            // Guest mode: use local store
            addItem(item, quantity);
            const productId = item.metadata?.productId;
            if (productId && typeof productId === 'number') {
                clearPendingByProductId(productId);
            }

            toast.success(t('added'), {
                icon: <ShoppingCart size={18} className="text-theme-primary" />,
                action: {
                    label: t('viewCart'),
                    onClick: () => router.push('/cart'),
                },
            });
        }
    };

    const removeFromCart = async (itemId: string) => {
        // CRITICAL: Only use API if authenticated
        // Guest users should only use local storage (no API calls)
        if (isAuthenticated && !isGuestMode) {
            beginMutation();
            try {
                // If a debounced quantity update is pending for this item, cancel it.
                const pending = pendingQtyByLocalId.get(itemId);
                if (pending?.timer) clearTimeout(pending.timer);
                pendingQtyByLocalId.delete(itemId);
                if (pendingQtyMutations.has(itemId)) {
                    pendingQtyMutations.delete(itemId);
                    endMutation(); // balance the mutation we started for the pending debounce
                }

                // Extract API item ID from metadata
                const item = useCartStore
                    .getState()
                    .items.find((i) => i.id === itemId);
                const apiItemId = item?.metadata?.apiItemId;

                if (!apiItemId || typeof apiItemId !== 'number') {
                    // Fallback to local removal if API ID not found
                    removeItem(itemId);
                    return;
                }

                // Optimistic UI
                removeItem(itemId);

                // Remove via API
                await cartService.removeItem(apiItemId);

                toast.success(t('removed') || 'تم حذف المنتج من السلة');
            } catch (error) {
                console.error(
                    'Failed to remove item from cart via API:',
                    error,
                );
                toast.error(t('removeError') || 'فشل حذف المنتج من السلة');
                // Restore server truth on failure
                await syncWithAPI();
            } finally {
                endMutation();
            }
        } else {
            // Guest mode: use local store
            removeItem(itemId);
        }
    };

    const updateItemQuantity = async (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        // CRITICAL: Only use API if authenticated
        // Guest users should only use local storage (no API calls)
        if (isAuthenticated && !isGuestMode) {
            try {
                // Extract API item ID from metadata
                const item = useCartStore
                    .getState()
                    .items.find((i) => i.id === itemId);
                const apiItemId = item?.metadata?.apiItemId;

                if (!apiItemId || typeof apiItemId !== 'number') {
                    // Fallback to local update if API ID not found
                    updateQuantity(itemId, quantity);
                    return;
                }

                // Optimistic UI first
                updateQuantity(itemId, quantity);

                // Optimistically update totals in metadata if we have API pricing.
                const after = useCartStore
                    .getState()
                    .items.find((i) => i.id === itemId);
                const apiPricing = after?.metadata?.apiPricing;
                const apiAddons = after?.metadata?.apiAddons;
                if (after && apiPricing) {
                    const addons_price = computeApiAddonsPrice(
                        apiAddons as
                            | Array<{
                                  quantity: number;
                                  price: number;
                                  multiply_by_quantity: boolean;
                              }>
                            | undefined,
                        quantity,
                    );
                    const subtotal = apiPricing.unit_price * quantity;
                    const total_price = subtotal + addons_price;
                    useCartStore.setState((s) => ({
                        items: s.items.map((i) =>
                            i.id === itemId
                                ? {
                                      ...i,
                                      metadata: {
                                          ...(i.metadata || {}),
                                          apiPricing: {
                                              ...apiPricing,
                                              subtotal,
                                              addons_price,
                                              total_price,
                                          },
                                      },
                                  }
                                : i,
                        ),
                    }));
                }

                // Debounce/coalesce rapid taps into a single PATCH.
                if (!pendingQtyMutations.has(itemId)) {
                    pendingQtyMutations.add(itemId);
                    beginMutation();
                }

                const existing = pendingQtyByLocalId.get(itemId);
                if (existing?.timer) clearTimeout(existing.timer);

                const nextPending: PendingQty = {
                    desiredQuantity: quantity,
                    apiItemId,
                    timer: setTimeout(async () => {
                        const latest = pendingQtyByLocalId.get(itemId);
                        if (!latest) return;
                        pendingQtyByLocalId.delete(itemId);

                        try {
                            const apiItem = await cartService.updateItem(
                                latest.apiItemId,
                                { quantity: latest.desiredQuantity },
                            );
                            const localItem =
                                transformApiCartItemToLocal(apiItem);
                            useCartStore.setState((s) => {
                                const idx = s.items.findIndex(
                                    (i) => i.metadata?.apiItemId === apiItem.id,
                                );
                                if (idx === -1)
                                    return { items: [...s.items, localItem] };
                                const next = [...s.items];
                                next[idx] = localItem;
                                return { items: next };
                            });
                        } catch (error) {
                            console.error(
                                'Failed to update item quantity via API:',
                                error,
                            );
                            toast.error(t('updateError') || 'فشل تحديث الكمية');
                            // Restore server truth
                            await syncWithAPI();
                        } finally {
                            if (pendingQtyMutations.has(itemId)) {
                                pendingQtyMutations.delete(itemId);
                                endMutation();
                            }
                        }
                    }, 350),
                };

                pendingQtyByLocalId.set(itemId, nextPending);
            } catch (error) {
                console.error('Failed to update item quantity via API:', error);
                toast.error(t('updateError') || 'فشل تحديث الكمية');
                // Restore server truth
                await syncWithAPI();
            }
        } else {
            // Guest mode: use local store
            updateQuantity(itemId, quantity);
        }
    };

    const updateItemConfiguration = async (
        itemId: string,
        newItem: Omit<CartItem, 'quantity'>,
        quantity: number,
    ) => {
        const current = useCartStore
            .getState()
            .items.find((i) => i.id === itemId);

        if (!current) return;

        if (isAuthenticated && !isGuestMode) {
            beginMutation();
            try {
                const apiItemId = current.metadata?.apiItemId;
                if (!apiItemId || typeof apiItemId !== 'number') {
                    removeItem(itemId);
                    addItem(newItem, quantity);
                    return;
                }

                // Normalize "no variant" to null on both sides.
                // Otherwise `undefined !== null` and we incorrectly take the POST+DELETE path,
                // which can merge items server-side and bump quantity unexpectedly.
                const currentVariant =
                    current.metadata?.product_variant_id ?? null;
                const nextVariant =
                    newItem.metadata?.product_variant_id ?? null;

                // Optimistic UI: update visible item immediately.
                useCartStore.setState((s) => ({
                    items: s.items.map((i) =>
                        i.id === itemId
                            ? {
                                  ...i,
                                  name: newItem.name,
                                  image: newItem.image,
                                  price: newItem.price,
                                  categoryId: newItem.categoryId,
                                  quantity,
                                  metadata: {
                                      ...(newItem.metadata || {}),
                                      apiItemId,
                                  },
                              }
                            : i,
                    ),
                }));

                if (currentVariant === nextVariant) {
                    const addons = transformLocalAddonsToApi(
                        newItem.metadata?.addons,
                    );
                    const updateRequest = {
                        // API requires quantity for PATCH (per CART docs / Postman collection)
                        quantity,
                        // IMPORTANT:
                        // - If user unselects all addons, we MUST send an empty array to clear server state.
                        //   Omitting `addons` would keep previous addons and reappear after the response.
                        addons,
                        // Same logic for clearable fields: send explicit empties to overwrite server state.
                        notes: newItem.metadata?.notes ?? '',
                        custom_fields: newItem.metadata?.custom_fields ?? {},
                    };
                    const apiItem = await cartService.updateItem(
                        apiItemId,
                        updateRequest,
                    );
                    const localItem = transformApiCartItemToLocal(apiItem);
                    useCartStore.setState((s) => {
                        const idx = s.items.findIndex(
                            (i) => i.metadata?.apiItemId === apiItem.id,
                        );
                        if (idx === -1)
                            return { items: [...s.items, localItem] };
                        const nextItems = [...s.items];
                        nextItems[idx] = localItem;
                        return { items: nextItems };
                    });
                } else {
                    const addRequest = transformCartItemToApiRequest(
                        newItem,
                        quantity,
                    );
                    const added = await cartService.addItem(addRequest);
                    await cartService.removeItem(apiItemId);
                    const localAdded = transformApiCartItemToLocal(added);
                    useCartStore.setState((s) => ({
                        items: [
                            ...s.items.filter(
                                (i) => i.metadata?.apiItemId !== apiItemId,
                            ),
                            localAdded,
                        ],
                    }));
                }

                const productId = newItem.metadata?.productId;
                if (productId && typeof productId === 'number') {
                    clearPendingByProductId(productId);
                }
            } catch (error) {
                console.error(
                    'Failed to update item configuration via API:',
                    error,
                );
                toast.error(t('updateError') || 'فشل تحديث الكمية');
                // Restore server truth on failure
                await syncWithAPI();
            } finally {
                endMutation();
            }
        } else {
            removeItem(itemId);
            addItem(newItem, quantity);
            const productId = newItem.metadata?.productId;
            if (productId && typeof productId === 'number') {
                clearPendingByProductId(productId);
            }
        }
    };

    const clearAllCart = async () => {
        if (isAuthenticated && !isGuestMode) {
            beginMutation();
            try {
                await cartService.clearCart();
                useCartStore.getState().clearCart();
                toast.success(t('cartCleared') || 'تم تفريغ السلة');
            } catch (error) {
                console.error('Failed to clear cart via API:', error);
                toast.error(t('clearError') || 'فشل تفريغ السلة');
            } finally {
                endMutation();
            }
        } else {
            useCartStore.getState().clearCart();
            toast.success(t('cartCleared') || 'تم تفريغ السلة');
        }
    };

    return {
        addToCart,
        removeFromCart,
        updateItemQuantity,
        updateItemConfiguration,
        clearAllCart,
    };
};
