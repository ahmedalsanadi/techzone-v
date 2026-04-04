'use client';

import React from 'react';
import { OrderItem } from '@/types/orders/orders.types';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { formatMoneyAmount } from '@/lib/utils';
import { addonContributionWithDefault } from '@/lib/products/addonPrice';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';
import DynamicImage from '@/components/ui/DynamicImage';
import CurrencySymbol from '../ui/CurrencySymbol';

interface OrderProductsCardProps {
    items: OrderItem[];
    onRateItem?: (item: OrderItem) => void;
    orderStatus?: string | number;
}

/** Turn API key into readable label (e.g. engraving_text → Engraving text) */
function formatFieldLabel(key: string): string {
    return key
        .split(/[_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

export function OrderProductsCard({
    items,
    onRateItem,
    orderStatus,
}: OrderProductsCardProps) {
    const t = useTranslations('Orders');
    const locale = useLocale();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-4 md:px-2">
                <h3 className="text-xl font-black text-gray-900">
                    {t('products.title')}
                </h3>
                <span className="text-xs font-bold text-gray-400">
                    ({items.length} {t('products.unit')})
                </span>
            </div>

            <div className="flex flex-col gap-4">
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
                                  item.variant_options as Record<
                                      string,
                                      unknown
                                  >,
                              ).length > 0);

                    // Map OrderItem status (1-5) to semantic variants
                    const getStatusVariant = (status: number): BadgeVariant => {
                        switch (status) {
                            case 1:
                                return 'warning'; // Reserved
                            case 2:
                                return 'secondary'; // Paid
                            case 3:
                            case 4:
                            case 5:
                                return 'destructive'; // Refunded, Partially Refunded, Cancelled
                            default:
                                return 'secondary';
                        }
                    };

                    return (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-start gap-4 md:gap-6 shadow-sm hover:shadow-md transition-shadow relative group">
                            {/* Product Image */}
                            <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                <DynamicImage
                                    src={item.product_image as string}
                                    alt={item.product_title}
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>

                            <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                {/* Product Info Content */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg md:text-xl">
                                        {item.product_title}
                                    </h3>

                                    {/* Item Status Badge */}
                                    {item.status_label && (
                                        <Badge
                                            variant={getStatusVariant(
                                                item.status,
                                            )}
                                            className="text-[10px] px-2 py-0.5 rounded-sm border-none mt-2">
                                            {item.status_label}
                                        </Badge>
                                    )}

                                    {/* Display Addons */}
                                    {hasAddons && (
                                        <div className="mt-2 space-y-1">
                                            {item.addons!.map((addon, idx) => {
                                                const addonLineTotal =
                                                    addonContributionWithDefault(
                                                        Number(addon.price),
                                                        addon.quantity,
                                                        addon.multiply_by_quantity,
                                                    );
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="text-xs text-gray-600">
                                                        <span className="font-semibold text-gray-700">
                                                            {addon.group_name ||
                                                                t('products.addon')}
                                                            :
                                                        </span>{' '}
                                                        {addon.title || addon.name}
                                                        {addon.quantity !== 1
                                                            ? ` (×${addon.quantity})`
                                                            : ''}
                                                        {' · '}
                                                        <span className="text-gray-400 inline-flex items-center gap-0.5">
                                                            {formatMoneyAmount(
                                                                addonLineTotal,
                                                                locale,
                                                            )}
                                                            <CurrencySymbol className="w-2.5 h-2.5" />
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Display Variant Options */}
                                    {hasVariantOptions && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {Array.isArray(item.variant_options)
                                                ? (
                                                      item.variant_options as unknown[]
                                                  ).map((opt, i) => (
                                                      <span
                                                          key={i}
                                                          className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                          {typeof opt ===
                                                              'object' &&
                                                          opt !== null
                                                              ? `${formatFieldLabel(
                                                                    Object.keys(
                                                                        opt as object,
                                                                    )[0] || '',
                                                                )}: ${Object.values(opt as object)[0] ?? ''}`
                                                              : String(opt)}
                                                      </span>
                                                  ))
                                                : Object.entries(
                                                      (item.variant_options ||
                                                          {}) as Record<
                                                          string,
                                                          unknown
                                                      >,
                                                  ).map(([key, value]) => (
                                                      <span
                                                          key={key}
                                                          className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                          {formatFieldLabel(
                                                              key,
                                                          )}
                                                          : {String(value)}
                                                      </span>
                                                  ))}
                                        </div>
                                    )}

                                    {/* Display Custom Fields */}
                                    {hasCustomFields && (
                                        <div className="mt-2 space-y-1 pt-2 border-t border-gray-50">
                                            {Object.entries(
                                                item.custom_fields!,
                                            ).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="text-[11px] text-gray-500 flex items-center justify-between max-w-[200px]">
                                                    <span className="font-semibold text-gray-600 capitalize">
                                                        {formatFieldLabel(key)}:
                                                    </span>
                                                    <span className="truncate mx-2 text-gray-700">
                                                        {value != null &&
                                                        value !== ''
                                                            ? String(value)
                                                            : '—'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Display Notes */}
                                    {item.notes && (
                                        <div className="mt-2 text-xs text-gray-500 italic">
                                            {t('products.notes') || 'Notes'}:{' '}
                                            {item.notes}
                                        </div>
                                    )}

                                    {/* Price and Quantity: use API unit_price/sale_unit_price and total_price */}
                                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                                        <div className="flex items-center gap-1 text-theme-primary font-black text-lg">
                                            <div className="flex items-center gap-0.5">
                                                {Number(item.total_discount) > 0 && (
                                                    <span className="text-sm text-gray-400 line-through font-semibold">
                                                        {formatMoneyAmount(
                                                            Number(item.unit_price),
                                                            locale,
                                                        )}
                                                        <CurrencySymbol className="w-3 h-3 inline ml-0.5" />
                                                    </span>
                                                )}
                                                <span>
                                                    {formatMoneyAmount(
                                                        Number(
                                                            item.sale_unit_price ??
                                                                item.unit_price,
                                                        ),
                                                        locale,
                                                    )}
                                                </span>
                                                <CurrencySymbol className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                            × {item.quantity}{' '}
                                            {t('products.quantity_unit') || 'Qty'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                                    {onRateItem &&
                                        (orderStatus === 'DELIVERED' ||
                                            orderStatus === 'COMPLETED') &&
                                        (item.review ? (
                                            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 shrink-0">
                                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                <span className="text-sm font-bold text-amber-700">
                                                    {item.review.rate.toFixed(
                                                        1,
                                                    )}
                                                </span>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onRateItem(item)}
                                                className="h-9 rounded-xl text-xs gap-1.5 border-gray-100 hover:bg-gray-50 hover:text-amber-500 hover:border-amber-200 transition-all font-bold">
                                                <Star className="w-4 h-4" />
                                                {t('actions.rateProduct') ||
                                                    'تقييم المنتج'}
                                            </Button>
                                        ))}

                                    <div className="flex flex-col items-end">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                            {t('products.totalPrice') ||
                                                'Total'}
                                        </div>
                                        <div className="text-base font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-1">
                                            <span>
                                                {formatMoneyAmount(
                                                    Number(item.total_price),
                                                    locale,
                                                )}
                                            </span>
                                            <CurrencySymbol className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
