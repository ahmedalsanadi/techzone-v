'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/useCartStore';
import { useCartActions } from '@/hooks/useCartActions';
import { Link, useRouter } from '@/i18n/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { useAuthStore } from '@/store/useAuthStore';

const CartPage = () => {
    const t = useTranslations('Cart');
    const {
        items,
        getTotalPrice,
        getTotalItems,
        syncWithAPI,
        isLoading,
        isGuestMode,
    } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const { updateItemQuantity, removeFromCart } = useCartActions();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        router.push('/checkout' as any);
    };
    if (!isMounted) return null;

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
                <Link
                    href="/products"
                    className="bg-theme-primary text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                    {t('backToMenu')}
                </Link>
            </div>
        );
    }

    const deliveryFee = 0; // Free for now
    const total = getTotalPrice() + deliveryFee;

    return (
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
                    {items.map((item) => {
                        const productSlug = item.metadata?.productSlug;
                        const productUrl = productSlug
                            ? `/products/${productSlug}`
                            : null;

                        return (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-100 p-4 md:p-6 rounded-3xl flex items-center gap-4 md:gap-6 shadow-sm hover:shadow-md transition-shadow">
                                {/* Product Image - Clickable */}
                                {productUrl ? (
                                    <Link
                                        href={productUrl}
                                        className="relative w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-2xl overflow-hidden shrink-0 hover:opacity-90 transition-opacity">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </Link>
                                ) : (
                                    <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
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

                                        {item.metadata?.variety && (
                                            <p className="text-sm text-gray-400 font-medium -mt-1">
                                                {item.metadata.variety.name}
                                            </p>
                                        )}

                                        {/* Display Addons */}
                                        {item.metadata?.addonDetails &&
                                            item.metadata.addonDetails.length >
                                                0 && (
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
                                                                    .join(', ')}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        {/* Display Variant Options */}
                                        {item.metadata?.variant_options &&
                                            Object.keys(
                                                item.metadata.variant_options,
                                            ).length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {Object.entries(
                                                        item.metadata
                                                            .variant_options,
                                                    ).map(([key, value]) => (
                                                        <span
                                                            key={key}
                                                            className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                            {key}:{' '}
                                                            {String(value)}
                                                        </span>
                                                    ))}
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
                                                {item.price * item.quantity}
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
                                                    ).map(([key, value]) => (
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
                                                    ))}
                                                </div>
                                            )}
                                    </div>

                                    <div
                                        className="flex items-center gap-4"
                                        onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateItemQuantity(
                                                        item.id,
                                                        item.quantity - 1,
                                                    );
                                                }}
                                                disabled={isLoading}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-10 text-center font-bold text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateItemQuantity(
                                                        item.id,
                                                        item.quantity + 1,
                                                    );
                                                }}
                                                disabled={isLoading}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromCart(item.id);
                                            }}
                                            disabled={isLoading}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <Trash2 size={20} />
                                        </button>
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
                                    <span>{getTotalPrice()}</span>
                                    <CurrencySymbol className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>{t('delivery')}</span>
                                <span className="font-bold text-green-600">
                                    {deliveryFee === 0
                                        ? t('free')
                                        : deliveryFee}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 pt-6 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-bold text-gray-900">
                                    {t('total')}
                                </span>
                                <div className="flex items-center gap-1.5 text-2xl font-black text-theme-primary">
                                    <span>{total}</span>
                                    <CurrencySymbol className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className="w-full bg-theme-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t('checkout')}
                                    <ArrowRight
                                        size={20}
                                        className="rtl:rotate-180"
                                    />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
