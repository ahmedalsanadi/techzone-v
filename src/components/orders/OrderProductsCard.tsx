'use client';

import React from 'react';
import Image from 'next/image';
import { OrderItem } from '@/types/orders';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface OrderProductsCardProps {
    items: OrderItem[];
}

export function OrderProductsCard({ items }: OrderProductsCardProps) {
    const t = useTranslations('Orders');
    const locale = useLocale();

    return (
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100/60 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-gray-900">
                    {t('products.title')}
                </h3>
                <span className="text-xs font-bold text-gray-400">
                    ({items.length} {t('products.unit')})
                </span>
            </div>

            <div className="flex flex-col gap-12">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex gap-4 md:gap-10 relative group">
                        {/* Product Image  */}
                        <div className="relative w-28 h-28 md:w-[140px] md:h-[140px] rounded-[32px] overflow-hidden shrink-0 shadow-sm border border-gray-50/50">
                            <Image
                                src={
                                    item.product_image ||
                                    '/images/placeholder.png'
                                }
                                alt={item.product_title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        {/* Product Info (Right Side in RTL) */}
                        <div className="flex flex-col flex-1 gap-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                                        {item.product_title}
                                    </h4>

                                    {/* Addons List */}
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {item.addons?.map((addon, i) => (
                                            <span
                                                key={i}
                                                className="text-[11px] md:text-[13px] font-bold text-gray-400 leading-tight">
                                                {addon.name ||
                                                    `${t('products.addon') || 'إضافة'} #${addon.addon_item_id}`}{' '}
                                                ({addon.quantity} ×{' '}
                                                {formatCurrency(
                                                    addon.price,
                                                    locale,
                                                )}
                                                )
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Column (Top Left of Text) */}
                                <div className="flex flex-col items-end shrink-0">
                                    <div className="flex items-center gap-1 font-black text-theme-primary text-xl">
                                        <span>
                                            {formatCurrency(
                                                item.sale_unit_price ||
                                                    item.unit_price,
                                                locale,
                                            )}
                                        </span>
                                    </div>
                                    {item.sale_unit_price &&
                                        item.unit_price >
                                            item.sale_unit_price && (
                                            <span className="text-xs font-bold text-gray-300 line-through">
                                                {formatCurrency(
                                                    item.unit_price,
                                                    locale,
                                                )}
                                            </span>
                                        )}
                                </div>
                            </div>

                            {/* Quantity and item status (e.g. Reserved, Paid) */}
                            <div className="mt-auto flex flex-wrap items-center gap-2">
                                <span className="text-sm font-black text-gray-900">
                                    {item.quantity}{' '}
                                    {t('products.quantity_unit') || 'x'}
                                </span>
                                {item.status_label && (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] px-2 py-0 font-medium">
                                        {item.status_label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
