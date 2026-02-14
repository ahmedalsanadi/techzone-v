'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/store/useCartStore';
import { useCartActions } from '@/hooks/cart';
import { Link, useRouter } from '@/i18n/navigation';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
    Edit,
    Loader2,
} from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { useAuthStore } from '@/store/useAuthStore';
import CartItemConfigModal from '@/components/modals/CartItemConfigModal';
import { Button } from '@/components/ui/Button';
import { formatMoneyAmount } from '@/lib/utils';

const CartPage = () => {
    const t = useTranslations('Cart');
    const locale = useLocale();
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
    const { updateItemQuantity, removeFromCart } = useCartActions();
    const [editingItem, setEditingItem] = useState<
        (typeof items)[number] | null
    >(null);
    const router = useRouter();
    const isMounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    // CRITICAL: Only sync cart with API when authenticated
    // Guest users should only see local cart (no API calls)
    useEffect(() => {
        if (!isMounted) return;

        // Only make API call if user is authenticated
        if (isAuthenticated && !isGuestMode) {
            syncWithAPI();
        }
        // If not authenticated, cart page will show local guest cart (or empty)
    }, [isMounted, isAuthenticated, isGuestMode, syncWithAPI]);

    const handleCheckout = () => {
        router.push('/checkout');
    };
    if (!isMounted) return null;

    if (isLoading && items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-4">
                        {[0, 1, 2].map((idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 w-3/5 bg-gray-100 rounded-lg animate-pulse" />
                                    <div className="h-3 w-2/5 bg-gray-100 rounded-lg animate-pulse" />
                                    <div className="h-3 w-1/3 bg-gray-100 rounded-lg animate-pulse" />
                                </div>
                                <div className="w-28 h-10 bg-gray-100 rounded-lg animate-pulse shrink-0" />
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-4">
                            <div className="h-5 w-32 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse" />
                            <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse mt-4" />
                        </div>
                    </div>
                </div>
                <p className="text-gray-500 text-sm mt-6">
                    {t('loading') || 'Loading your cart...'}
                </p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                    {t('empty')}
                </h1>
                <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                    {t('emptyDesc')}
                </p>
                <Button
                    asChild
                    variant="primary"
                    size="2xl"
                    className="hover:-translate-y-1 active:scale-95">
                    <Link href="/products">{t('backToMenu')}</Link>
                </Button>
            </div>
        );
    }

    const subtotal = getTotalPrice();
    const isCartMutating = isAuthenticated && !isGuestMode && mutationsInFlight > 0;
    const disableCheckout = isLoading || isCartMutating;

    return (
        <>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-10 flex items-center gap-3">
                    {t('title')}
                    <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {t('items', { count: getTotalItems() })}
                    </span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {pendingItems.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-900">
                                <h3 className="font-bold text-base mb-2">
                                    {t('needsConfigTitle') ||
                                        'Some items need configuration'}
                                </h3>
                                <p className="text-sm text-amber-800 mb-3">
                                    {t('needsConfigDesc') ||
                                        'Review these items before they can be added to your cart.'}
                                </p>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <span className="text-xs text-amber-700">
                                        {pendingItems.length}{' '}
                                        {t('items', {
                                            count: pendingItems.length,
                                        })}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={clearPendingItems}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-800 p-0 h-auto min-h-0 underline">
                                        {t('clearPending') ||
                                            'Clear pending items'}
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {pendingItems.map((item) => {
                                        const slug = item.metadata?.productSlug;
                                        const url = slug
                                            ? `/products/${slug}`
                                            : '/products';
                                        return (
                                            <Link
                                                key={item.id}
                                                href={url}
                                                className="flex items-center justify-between bg-white/60 border border-amber-100 rounded-xl px-3 py-2 text-sm font-medium hover:bg-white transition-colors">
                                                <span className="truncate">
                                                    {item.name}
                                                </span>
                                                <span className="text-amber-700 font-bold">
                                                    {t('configure') ||
                                                        'Configure'}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {items.map((item) => {
                            const productSlug = item.metadata?.productSlug;
                            const productUrl = productSlug
                                ? `/products/${productSlug}`
                                : null;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 md:gap-6 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Product Image - Clickable */}
                                    {productUrl ? (
                                        <Link
                                            href={productUrl}
                                            className="relative w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 hover:opacity-90 transition-opacity">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </Link>
                                    ) : (
                                        <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Product Info Content */}
                                        <div className="flex-1">
                                            {productUrl ? (
                                                <Link
                                                    href={productUrl}
                                                    className="group/title block">
                                                    <h3 className="font-bold text-gray-900 text-lg md:text-xl group-hover/title:text-theme-primary transition-colors">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                            ) : (
                                                <h3 className="font-bold text-gray-900 text-lg md:text-xl">
                                                    {item.name}
                                                </h3>
                                            )}

                                            {item.metadata?.variety ? (
                                                <p className="text-sm text-gray-400 font-medium -mt-1">
                                                    {item.metadata.variety.name}
                                                </p>
                                            ) : null}

                                            {/* Display Addons */}
                                            {item.metadata?.addonDetails &&
                                            item.metadata.addonDetails.length > 0 ? (
                                                    <div className="mt-2 space-y-1">
                                                        {item.metadata.addonDetails.map(
                                                            (
                                                                addonGroup: {
                                                                    groupName: string;
                                                                    items: Array<{
                                                                        name: string;
                                                                        quantity: number;
                                                                    }>;
                                                                },
                                                                idx: number,
                                                            ) => (
                                                                <div
                                                                    key={idx}
                                                                    className="text-xs text-gray-600">
                                                                    <span className="font-semibold text-gray-700">
                                                                        {
                                                                            addonGroup.groupName
                                                                        }
                                                                        :
                                                                    </span>{' '}
                                                                    {addonGroup.items
                                                                        .map(
                                                                            (addonItem: {
                                                                                name: string;
                                                                                quantity: number;
                                                                            }) =>
                                                                                `${
                                                                                    addonItem.name
                                                                                }${
                                                                                    addonItem.quantity >
                                                                                    1
                                                                                        ? ` (x${addonItem.quantity})`
                                                                                        : ''
                                                                                }`,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}

                                            {/* Display Variant Options */}
                                            {item.metadata?.variant_options &&
                                                Object.keys(
                                                    item.metadata
                                                        .variant_options,
                                                ).length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {Object.entries(
                                                            item.metadata
                                                                .variant_options,
                                                        ).map(
                                                            ([key, value]) => (
                                                                <span
                                                                    key={key}
                                                                    className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                                    {key}:{' '}
                                                                    {String(
                                                                        value,
                                                                    )}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                            {/* Display Notes */}
                                            {item.metadata?.notes && (
                                                <div className="mt-2 text-xs text-gray-500 italic">
                                                    {t('notes')}:{' '}
                                                    {item.metadata.notes}
                                                </div>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-center gap-1 mt-1 text-theme-primary font-black">
                                                <span>
                                                    {formatMoneyAmount(
                                                        item.price *
                                                            item.quantity,
                                                        locale,
                                                    )}
                                                </span>
                                                <CurrencySymbol className="w-3.5 h-3.5" />
                                            </div>

                                            {/* Display Custom Fields */}
                                            {item.metadata?.custom_fields &&
                                                Object.keys(
                                                    item.metadata.custom_fields,
                                                ).length > 0 && (
                                                    <div className="mt-2 space-y-0.5 border-t border-gray-100 pt-2">
                                                        {Object.entries(
                                                            item.metadata
                                                                .custom_fields,
                                                        ).map(
                                                            ([key, value]) => (
                                                                <div
                                                                    key={key}
                                                                    className="text-[11px] text-gray-500 flex items-center justify-between">
                                                                    <span className="font-semibold text-gray-600 capitalize">
                                                                        {key.replace(
                                                                            /_/g,
                                                                            ' ',
                                                                        )}
                                                                        :
                                                                    </span>
                                                                    <span className="truncate ml-2 text-gray-700">
                                                                        {typeof value ===
                                                                        'boolean'
                                                                            ? value
                                                                                ? 'Yes'
                                                                                : 'No'
                                                                            : String(
                                                                                  value,
                                                                              )}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                        </div>

                                        <div
                                            className="flex flex-wrap items-center gap-3 w-full md:w-auto"
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }>
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-1 shrink-0">
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateItemQuantity(
                                                            item.id,
                                                            item.quantity - 1,
                                                        );
                                                    }}
                                                    disabled={isLoading}
                                                    className="hover:bg-gray-200/50 active:scale-95">
                                                    <Minus />
                                                </Button>
                                                <span className="w-10 text-center font-bold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateItemQuantity(
                                                            item.id,
                                                            item.quantity + 1,
                                                        );
                                                    }}
                                                    disabled={isLoading}
                                                    className="hover:bg-gray-200/50 active:scale-95">
                                                    <Plus />
                                                </Button>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingItem(item);
                                                }}
                                                disabled={isLoading}
                                                className="hover:text-theme-primary"
                                                aria-label={t('editItem') || 'Edit item'}>
                                                <Edit />
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromCart(item.id);
                                                }}
                                                disabled={isLoading}
                                                className="hover:text-red-500 hover:bg-red-50"
                                                aria-label={t('removeItem') || 'Remove item'}>
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                {t('summary')}
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('subtotal')}</span>
                                    <div className="flex items-center gap-1 font-bold text-gray-900">
                                        <span>
                                            {formatMoneyAmount(subtotal, locale)}
                                        </span>
                                        <CurrencySymbol className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('delivery')}</span>
                                    <span className="text-gray-500 text-sm">
                                        {t('deliveryAtCheckout')}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-6 mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        {t('total')}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-2xl font-black text-theme-primary">
                                        <span>
                                            {formatMoneyAmount(subtotal, locale)}
                                        </span>
                                        <CurrencySymbol className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                onClick={handleCheckout}
                                disabled={disableCheckout}
                                size="xl"
                                className="w-full hover:-translate-y-0.5 active:scale-95">
                                {disableCheckout ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <span className="w-full text-center">
                                            {t('checkout')}
                                        </span>
                                        <ArrowRight
                                            size={20}
                                            className="rtl:rotate-180"
                                        />
                                    </div>
                                )}
                            </Button>
                        </div>
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
