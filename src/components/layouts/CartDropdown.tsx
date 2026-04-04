'use client';

import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import DynamicImage from '../ui/DynamicImage';
import { useCartStore } from '@/store/useCartStore';
import { Link } from '@/i18n/navigation';
import CurrencySymbol from '../ui/CurrencySymbol';
import { useAuthStore } from '@/store/useAuthStore';
import React, { useEffect } from 'react';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { BaseMenuItems } from '../ui/BaseMenuItems';
import { Button } from '@/components/ui/Button';
import { useCartActions } from '@/hooks/cart';
import { formatMoneyAmount } from '@/lib/utils';
import { getCartItemLineTotal } from '@/lib/cart/utils';
import type { CartItemMetadata } from '@/store/useCartStore';

const CartDropdown = () => {
    const t = useTranslations('Cart');
    const locale = useLocale();
    const {
        items,
        getTotalItems,
        getTotalPrice,
        syncWithAPI,
        isLoading,
        isGuestMode,
    } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const { removeFromCart } = useCartActions();
    const count = getTotalItems();

    useEffect(() => {
        if (isAuthenticated && !isGuestMode) {
            syncWithAPI();
        }
    }, [isAuthenticated, isGuestMode, syncWithAPI]);

    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors outline-none">
                <ShoppingCart className="size-5 md:size-6" strokeWidth={1.5} />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-theme-primary shadow-sm">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </MenuButton>

            <BaseMenuItems
                anchor="bottom end"
                className="w-[calc(100vw-1rem)] sm:w-80 md:w-96 max-h-[calc(100vh-4rem)] flex flex-col p-0 overflow-hidden rounded-2xl">
                {/* Header */}
                <div className="px-4 py-2.5 sm:py-3 bg-linear-to-r from-gray-50 to-white border-b border-gray-100 shrink-0">
                    <h3 className="font-bold flex items-center gap-2 text-gray-900 text-sm sm:text-base">
                        <ShoppingCart size={18} strokeWidth={2} />
                        {t('title')}
                    </h3>
                </div>

                {/* Items List */}
                <div className="max-h-48 sm:max-h-96 overflow-y-auto p-2 sm:p-3 scrollbar-hide flex-1 min-h-0">
                    {items.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            {isLoading ? (
                                <div className="w-10 h-10 border-3 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            ) : (
                                <>
                                    <ShoppingCart
                                        size={40}
                                        className="mx-auto text-gray-200 mb-3 sm:size-12"
                                        strokeWidth={1.5}
                                    />
                                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                                        {t('empty')}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {items.map((item) => (
                                <MenuItem key={item.id} as="div">
                                    <div className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                                        {(() => {
                                            const metadata =
                                                (item.metadata as unknown as CartItemMetadata) ||
                                                undefined;
                                            return (
                                                <>
                                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                        <DynamicImage
                                                            src={item.image}
                                                            mediaSizes={
                                                                metadata?.media
                                                                    ?.cover
                                                                    ?.sizes
                                                            }
                                                            alt={item.name}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate mb-0.5">
                                                            {item.name}
                                                        </h4>

                                                        {/* Variety */}
                                                        {metadata?.variety ? (
                                                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5 sm:mb-1">
                                                                {
                                                                    metadata
                                                                        .variety
                                                                        .name
                                                                }
                                                            </p>
                                                        ) : null}

                                                        {/* Variant Options Summary */}
                                                        {metadata?.variant_options &&
                                                            Object.keys(
                                                                metadata.variant_options,
                                                            ).length > 0 && (
                                                                <div className="flex flex-wrap gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                                                                    {Object.entries(
                                                                        metadata.variant_options,
                                                                    ).map(
                                                                        ([
                                                                            k,
                                                                            v,
                                                                        ]) => (
                                                                            <span
                                                                                key={
                                                                                    k
                                                                                }
                                                                                className="text-[8px] sm:text-[9px] text-gray-400 bg-gray-50 px-1 rounded border border-gray-100/50">
                                                                                {
                                                                                    k
                                                                                }

                                                                                :{' '}
                                                                                {String(
                                                                                    v,
                                                                                )}
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}

                                                        {/* Addons Summary: "Name (qty) price" */}
                                                        {metadata?.addonDetails &&
                                                            metadata.addonDetails
                                                                .length > 0 && (
                                                                <p className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 sm:mb-1 line-clamp-2">
                                                                    {metadata.addonDetails
                                                                        .flatMap(
                                                                            (g) =>
                                                                                g.items,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                i: {
                                                                                    name: string;
                                                                                    quantity: number;
                                                                                    price: number;
                                                                                    multiplyByQuantity?: boolean;
                                                                                },
                                                                            ) => {
                                                                                const displayQty =
                                                                                    i.quantity;
                                                                                return `${i.name} (${displayQty}) ${formatMoneyAmount(i.price, locale)}`;
                                                                            },
                                                                        )
                                                                        .join(
                                                                            ' · ',
                                                                        )}
                                                                </p>
                                                            )}

                                                        {/* Custom Fields Summary */}
                                                        {metadata?.custom_fields &&
                                                            Object.keys(
                                                                metadata.custom_fields,
                                                            ).length > 0 && (
                                                                <p className="text-[9px] sm:text-[10px] text-gray-400 line-clamp-1 italic mb-0.5 sm:mb-1">
                                                                    {Object.entries(
                                                                        metadata.custom_fields,
                                                                    )
                                                                        .map(
                                                                            ([
                                                                                k,
                                                                                v,
                                                                            ]) =>
                                                                                `${k.replace(/_/g, ' ')}: ${v}`,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        )}
                                                                </p>
                                                            )}

                                                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                                                            x{item.quantity}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-theme-primary">
                                                            <span>
                                                                {formatMoneyAmount(
                                                                    getCartItemLineTotal(
                                                                        item,
                                                                    ),
                                                                    locale,
                                                                )}
                                                            </span>
                                                            <CurrencySymbol className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() =>
                                                            void removeFromCart(
                                                                item.id,
                                                            )
                                                        }
                                                        className="hover:text-red-500 hover:bg-red-50 shrink-0">
                                                        <X
                                                            size={14}
                                                            strokeWidth={2}
                                                            className="sm:size-4"
                                                        />
                                                    </Button>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </MenuItem>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <span className="text-xs sm:text-sm text-gray-600 font-semibold">
                                {t('total')}
                            </span>
                            <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-gray-900">
                                <span>
                                    {formatMoneyAmount(getTotalPrice(), locale)}
                                </span>
                                <CurrencySymbol className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                            <MenuItem>
                                <Link
                                    href="/cart"
                                    className="w-full bg-white text-gray-900 text-center font-semibold py-2 sm:py-2.5 rounded-xl block transition-all hover:bg-gray-100 border border-gray-200 text-sm">
                                    {t('viewCart')}
                                </Link>
                            </MenuItem>

                            <MenuItem>
                                <Link
                                    href="/cart"
                                    className="w-full bg-theme-primary text-white text-center font-semibold py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-95 active:scale-[0.98] shadow-md text-sm">
                                    {t('checkout')}
                                    <ArrowRight
                                        size={16}
                                        className="rtl:rotate-180 sm:size-[18px]"
                                    />
                                </Link>
                            </MenuItem>
                        </div>
                    </div>
                )}
            </BaseMenuItems>
        </Menu>
    );
};

export default CartDropdown;
