'use client';

import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import DynamicImage from '../ui/DynamicImage';
import { useCartStore } from '@/store/useCartStore';
import { Link } from '@/i18n/navigation';
import CurrencySymbol from '../ui/CurrencySymbol';
import { useAuthStore } from '@/store/useAuthStore';
import React, { useEffect } from 'react';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { BaseMenuItems } from '../ui/BaseMenuItems';

const CartDropdown = () => {
    const t = useTranslations('Cart');
    const {
        items,
        removeItem,
        getTotalItems,
        getTotalPrice,
        syncWithAPI,
        isLoading,
        isGuestMode,
    } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const count = getTotalItems();

    useEffect(() => {
        if (isAuthenticated && !isGuestMode) {
            syncWithAPI();
        }
    }, [isAuthenticated, isGuestMode, syncWithAPI]);

    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors outline-none">
                <ShoppingCart size={24} strokeWidth={1.5} />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-theme-primary shadow-sm">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </MenuButton>

            <BaseMenuItems
                anchor="bottom end"
                className="w-80 md:w-96 p-0 overflow-hidden rounded-2xl">
                {/* Header */}
                <div className="px-4 py-3 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
                    <h3 className="font-bold flex items-center gap-2 text-gray-900 text-base">
                        <ShoppingCart size={18} strokeWidth={2} />
                        {t('title')}
                    </h3>
                </div>

                {/* Items List */}
                <div className="max-h-96 overflow-y-auto p-3 scrollbar-hide">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            {isLoading ? (
                                <div className="w-10 h-10 border-3 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            ) : (
                                <>
                                    <ShoppingCart
                                        size={48}
                                        className="mx-auto text-gray-200 mb-3"
                                        strokeWidth={1.5}
                                    />
                                    <p className="text-sm font-medium text-gray-400">
                                        {t('empty')}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <MenuItem key={item.id} as="div">
                                    <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            <DynamicImage
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                                                {item.name}
                                            </h4>

                                            {/* Variety */}
                                            {item.metadata?.variety && (
                                                <p className="text-[10px] text-gray-400 font-medium mb-1">
                                                    {item.metadata.variety.name}
                                                </p>
                                            )}

                                            {/* Variant Options Summary */}
                                            {item.metadata?.variant_options &&
                                                Object.keys(
                                                    item.metadata
                                                        .variant_options,
                                                ).length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-1">
                                                        {Object.entries(
                                                            item.metadata
                                                                .variant_options,
                                                        ).map(([k, v]) => (
                                                            <span
                                                                key={k}
                                                                className="text-[9px] text-gray-400 bg-gray-50 px-1 rounded border border-gray-100/50">
                                                                {k}: {String(v)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                            {/* Addons Summary */}
                                            {item.metadata?.addonDetails &&
                                                item.metadata.addonDetails
                                                    .length > 0 && (
                                                    <p className="text-[10px] text-gray-400 line-clamp-1 mb-1">
                                                        {item.metadata.addonDetails
                                                            .map((g: any) =>
                                                                g.items
                                                                    .map(
                                                                        (
                                                                            i: any,
                                                                        ) =>
                                                                            i.name,
                                                                    )
                                                                    .join(', '),
                                                            )
                                                            .join(', ')}
                                                    </p>
                                                )}

                                            {/* Custom Fields Summary */}
                                            {item.metadata?.custom_fields &&
                                                Object.keys(
                                                    item.metadata.custom_fields,
                                                ).length > 0 && (
                                                    <p className="text-[10px] text-gray-400 line-clamp-1 italic mb-1">
                                                        {Object.entries(
                                                            item.metadata
                                                                .custom_fields,
                                                        )
                                                            .map(
                                                                ([k, v]) =>
                                                                    `${k.replace(
                                                                        /_/g,
                                                                        ' ',
                                                                    )}: ${v}`,
                                                            )
                                                            .join(', ')}
                                                    </p>
                                                )}

                                            <p className="text-xs text-gray-500 mb-1">
                                                x{item.quantity}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm font-bold text-theme-primary">
                                                <span>
                                                    {item.price * item.quantity}
                                                </span>
                                                <CurrencySymbol className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <X size={16} strokeWidth={2} />
                                        </button>
                                    </div>
                                </MenuItem>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-600 font-semibold">
                                {t('total')}
                            </span>
                            <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                                <span>{getTotalPrice()}</span>
                                <CurrencySymbol className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <MenuItem>
                                <Link
                                    href="/cart"
                                    className="w-full bg-white text-gray-900 text-center font-semibold py-2.5 rounded-xl block transition-all hover:bg-gray-100 border border-gray-200">
                                    {t('viewCart')}
                                </Link>
                            </MenuItem>

                            <MenuItem>
                                <Link
                                    href="/cart"
                                    className="w-full bg-theme-primary text-white text-center font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-95 active:scale-[0.98] shadow-md">
                                    {t('checkout')}
                                    <ArrowRight
                                        size={18}
                                        className="rtl:rotate-180"
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
