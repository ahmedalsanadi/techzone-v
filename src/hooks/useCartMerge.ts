/**
 * Hook for merging guest cart with customer cart after authentication
 */

import { useCallback } from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { cartService } from '@/services/cart-service';
import { transformLocalCartToGuestCart } from '@/lib/cart/transform';
import { storeService } from '@/services/store-service';
import { validateRequiredSelections } from '@/lib/products/requirements';
import type { Product } from '@/services/types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useCartMerge() {
    const t = useTranslations('Cart');
    const {
        getGuestCartItems,
        setGuestMode,
        setCartFromAPI,
        syncWithAPI,
        setPendingItems,
    } = useCartStore();

    const mergeGuestCartAfterAuth = useCallback(async () => {
        try {
            // Get guest cart items (only if in guest mode)
            const guestItems = getGuestCartItems();

            if (guestItems.length === 0) {
                // No guest items to merge, just sync with API
                setGuestMode(false);
                await syncWithAPI();
                return;
            }

            // Validate required selections before merge
            const uniqueSlugs = Array.from(
                new Set(
                    guestItems
                        .map((item) => item.metadata?.productSlug)
                        .filter((slug): slug is string => typeof slug === 'string'),
                ),
            );

            const productsBySlug = new Map<string, Product>();
            await Promise.all(
                uniqueSlugs.map(async (slug) => {
                    try {
                        const product = await storeService.getProduct(slug);
                        productsBySlug.set(slug, product);
                    } catch {
                        // Ignore fetch errors for now; items will be marked invalid
                    }
                }),
            );

            const validItems: CartItem[] = [];
            const invalidItems: CartItem[] = [];

            guestItems.forEach((item) => {
                const slug = item.metadata?.productSlug;
                const product = slug ? productsBySlug.get(slug) : null;
                if (!product) {
                    invalidItems.push({
                        ...item,
                        metadata: {
                            ...item.metadata,
                            needsConfiguration: true,
                        },
                    });
                    return;
                }

                const selection = {
                    selectedVariantId: item.metadata?.product_variant_id || null,
                    selectedAddons:
                        item.metadata?.addons && typeof item.metadata.addons === 'object'
                            ? item.metadata.addons
                            : {},
                    customFields:
                        item.metadata?.custom_fields &&
                        typeof item.metadata.custom_fields === 'object'
                            ? item.metadata.custom_fields
                            : {},
                };

                const validation = validateRequiredSelections(product, selection);
                if (!validation.isValid) {
                    invalidItems.push({
                        ...item,
                        metadata: {
                            ...item.metadata,
                            needsConfiguration: true,
                        },
                    });
                    return;
                }

                validItems.push(item);
            });

            if (invalidItems.length > 0) {
                setPendingItems(invalidItems);
                toast.info(
                    t('needsConfigToast') ||
                        'Some items need configuration before adding to your cart.',
                );
            }

            // Transform guest cart items to API format
            const guestCartItems = transformLocalCartToGuestCart(validItems);

            if (guestCartItems.length === 0) {
                // No valid items to merge, just sync with API
                setGuestMode(false);
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
        setGuestMode,
        setPendingItems,
        t,
    ]);

    return { mergeGuestCartAfterAuth };
}
