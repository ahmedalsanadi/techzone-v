// src/hooks/useCartActions.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cartService } from '@/services/cart-service';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import React from 'react';
import { useRouter } from '@/i18n/navigation';
import type { AddCartAddon } from '@/types/cart';

export const useCartActions = () => {
    const addItem = useCartStore((state) => state.addItem);
    const syncWithAPI = useCartStore((state) => state.syncWithAPI);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const isGuestMode = useCartStore((state) => state.isGuestMode);
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
            try {
                // Extract product_id from metadata
                const productId = item.metadata?.productId;
                if (!productId || typeof productId !== 'number') {
                    throw new Error('Product ID is required');
                }

                // Transform addons to API format
                const addons: AddCartAddon[] = [];
                const localAddons = item.metadata?.addons;
                
                if (localAddons && typeof localAddons === 'object') {
                    Object.entries(localAddons).forEach(([groupId, items]) => {
                        if (items && typeof items === 'object') {
                            Object.entries(items).forEach(([itemId, qty]) => {
                                const addonQty = typeof qty === 'number' ? qty : 0;
                                if (addonQty > 0) {
                                    addons.push({
                                        addon_item_id: parseInt(itemId, 10),
                                        quantity: addonQty,
                                    });
                                }
                            });
                        }
                    });
                }

                // Prepare API request
                const apiRequest = {
                    product_id: productId,
                    product_variant_id: item.metadata?.product_variant_id || null,
                    quantity,
                    ...(addons.length > 0 && { addons }),
                    ...(item.metadata?.notes && { notes: item.metadata.notes }),
                    ...(item.metadata?.custom_fields && {
                        custom_fields: item.metadata.custom_fields,
                    }),
                    ...(item.metadata?.variant_options && {
                        variant_options: item.metadata.variant_options,
                    }),
                };

                // Add item via API
                await cartService.addItem(apiRequest);

                // Sync cart with API to get updated state
                await syncWithAPI();

                toast.success(t('added', { name: item.name }), {
                    icon: <ShoppingCart size={18} className="text-theme-primary" />,
                    description: t('viewCart'),
                    action: {
                        label: t('viewCart'),
                        onClick: () => router.push('/cart'),
                    },
                });
            } catch (error) {
                console.error('Failed to add item to cart via API:', error);
                toast.error(t('addError') || 'فشل إضافة المنتج إلى السلة');
            }
        } else {
            // Guest mode: use local store
            addItem(item, quantity);

            toast.success(t('added', { name: item.name }), {
                icon: <ShoppingCart size={18} className="text-theme-primary" />,
                description: t('viewCart'),
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
            try {
                // Extract API item ID from metadata
                const item = useCartStore.getState().items.find((i) => i.id === itemId);
                const apiItemId = item?.metadata?.apiItemId;

                if (!apiItemId || typeof apiItemId !== 'number') {
                    // Fallback to local removal if API ID not found
                    removeItem(itemId);
                    return;
                }

                // Remove via API
                await cartService.removeItem(apiItemId);

                // Sync cart with API
                await syncWithAPI();

                toast.success(t('removed') || 'تم حذف المنتج من السلة');
            } catch (error) {
                console.error('Failed to remove item from cart via API:', error);
                toast.error(t('removeError') || 'فشل حذف المنتج من السلة');
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
                const item = useCartStore.getState().items.find((i) => i.id === itemId);
                const apiItemId = item?.metadata?.apiItemId;

                if (!apiItemId || typeof apiItemId !== 'number') {
                    // Fallback to local update if API ID not found
                    updateQuantity(itemId, quantity);
                    return;
                }

                // Update via API
                await cartService.updateItem(apiItemId, { quantity });

                // Sync cart with API
                await syncWithAPI();
            } catch (error) {
                console.error('Failed to update item quantity via API:', error);
                toast.error(t('updateError') || 'فشل تحديث الكمية');
            }
        } else {
            // Guest mode: use local store
            updateQuantity(itemId, quantity);
        }
    };

    return { addToCart, removeFromCart, updateItemQuantity };
};
