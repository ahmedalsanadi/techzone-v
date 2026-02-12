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

/** Turn API key into readable label (e.g. engraving_text → Engraving text) */
function formatFieldLabel(key: string): string {
    return key
        .split(/[_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
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
                {items.map((item) => {
                    const hasAddons = item.addons && item.addons.length > 0;
                    const hasCustomFields =
                        item.custom_fields &&
                        typeof item.custom_fields === 'object' &&
                        Object.keys(item.custom_fields).length > 0;
                    const hasVariantOptions =
                        item.variant_options != null &&
                        (Array.isArray(item.variant_options)
                            ? item.variant_options.length > 0
                            : typeof item.variant_options === 'object' &&
                              Object.keys(
                                  item.variant_options as Record<string, unknown>,
                              ).length > 0);

                    return (
                        <div
                            key={item.id}
                            className="flex gap-4 md:gap-10 relative group">
                            {/* Product Image */}
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
                            {/* Product Info */}
                            <div className="flex flex-col flex-1 gap-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                                            {item.product_title}
                                        </h4>

                                        {/* Addons */}
                                        {hasAddons && (
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                    {t('products.addons')}
                                                </span>
                                                {item.addons!.map((addon, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[11px] md:text-[13px] font-medium text-gray-600 leading-tight">
                                                        {addon.group_name ? (
                                                            <>
                                                                <span className="text-gray-500">
                                                                    {addon.group_name}
                                                                    :{' '}
                                                                </span>
                                                                {addon.title ||
                                                                    addon.name ||
                                                                    `#${addon.addon_item_id}`}
                                                            </>
                                                        ) : (
                                                            addon.title ||
                                                                addon.name ||
                                                                `${t('products.addon')} #${addon.addon_item_id}`
                                                        )}
                                                        {' · '}
                                                        {addon.quantity} ×{' '}
                                                        {formatCurrency(
                                                            addon.price,
                                                            locale,
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Variant options (e.g. size, color) */}
                                        {hasVariantOptions && (
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                    {t('products.variantOptions')}
                                                </span>
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] md:text-[13px] font-medium text-gray-600">
                                                    {Array.isArray(
                                                        item.variant_options,
                                                    ) ? (
                                                        (item.variant_options as unknown[]).map(
                                                            (opt, i) => (
                                                                <span key={i}>
                                                                    {typeof opt ===
                                                                    'object' && opt !== null
                                                                        ? `${formatFieldLabel(
                                                                              Object.keys(opt as object)[0] || '',
                                                                          )}: ${Object.values(opt as object)[0] ?? ''}`
                                                                        : String(opt)}
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        Object.entries(
                                                            (item.variant_options || {}) as Record<
                                                                string,
                                                                unknown
                                                            >,
                                                        ).map(([key, value]) => (
                                                            <span key={key}>
                                                                {formatFieldLabel(key)}:{' '}
                                                                {value != null
                                                                    ? String(value)
                                                                    : '—'}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Custom fields (e.g. engraving_text, font_style) */}
                                        {hasCustomFields && (
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                    {t('products.customFields')}
                                                </span>
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] md:text-[13px] font-medium text-gray-600">
                                                    {Object.entries(
                                                        item.custom_fields!,
                                                    ).map(([key, value]) => (
                                                        <span key={key}>
                                                            {formatFieldLabel(
                                                                key,
                                                            )}:{' '}
                                                            {value != null &&
                                                            value !== ''
                                                                ? String(value)
                                                                : '—'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {item.notes && (
                                            <p className="text-[11px] text-gray-500 mt-0.5 italic">
                                                {item.notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price */}
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

                                {/* Quantity and item status */}
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
                    );
                })}
            </div>
        </div>
    );
}
