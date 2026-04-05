'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useCartActions } from '@/hooks/cart';
import { useAuthStore } from '@/store/useAuthStore';
import CartItemConfigModal from '@/components/modals/CartItemConfigModal';
import type { CartItem } from '@/store/useCartStore';
import {
    CartPageSkeleton,
    CartEmptyState,
    CartPendingItemsBanner,
    CartLineItem,
    CartSummary,
} from '@/components/cart';

const CartPage = () => {
    const t = useTranslations('Cart');
    const {
        items,
        pendingItems,
        getTotalPrice,
        getTotalItems,
        syncWithAPI,
        isLoading,
        isGuestMode,
        mutationsInFlight,
        clearPendingItems,
    } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const { updateItemQuantity } = useCartActions();
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const router = useRouter();
    const isMounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    useEffect(() => {
        if (!isMounted) return;
        if (isAuthenticated && !isGuestMode) {
            syncWithAPI();
        }
    }, [isMounted, isAuthenticated, isGuestMode, syncWithAPI]);

    const handleCheckout = () => {
        router.push('/checkout');
    };

    if (!isMounted) return null;

    if (isLoading && items.length === 0) {
        return <CartPageSkeleton />;
    }

    if (items.length === 0) {
        return <CartEmptyState />;
    }

    const subtotal = getTotalPrice();
    const isCartMutating =
        isAuthenticated && !isGuestMode && mutationsInFlight > 0;
    const disableCheckout = isLoading || isCartMutating;

    return (
        <>
            <div className="space-y-6 py-4">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                    {t('title')}
                    <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {t('items', { count: getTotalItems() })}
                    </span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-4">
                        <CartPendingItemsBanner
                            pendingItems={pendingItems}
                            onClearPending={clearPendingItems}
                        />
                        {items.map((item) => (
                            <CartLineItem
                                key={item.id}
                                item={item}
                                disableCheckout={disableCheckout}
                                onQuantityChange={(id, quantity) =>
                                    updateItemQuantity(id, quantity)
                                }
                            />
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <CartSummary
                            subtotal={subtotal}
                            disableCheckout={disableCheckout}
                            onCheckout={handleCheckout}
                        />
                    </div>
                </div>
            </div>
            {editingItem && (
                <CartItemConfigModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    item={editingItem}
                />
            )}
        </>
    );
};

export default CartPage;
