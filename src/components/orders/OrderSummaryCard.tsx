// src/app/[locale]/my-orders/utils/components/OrderSummaryCard.tsx
'use client';

import React from 'react';
import { Order } from '@/types/orders';
import {
    formatMoneyAmount,
    formatOrderDateTime,
} from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import CurrencySymbol from '../ui/CurrencySymbol';
import { getOrderStatusPresentation } from '@/lib/orders/status';

interface OrderSummaryCardProps {
    order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    const t = useTranslations('Orders.summary');
    const tOrders = useTranslations('Orders');
    const locale = useLocale();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const formattedDate = React.useMemo(() => {
        if (!mounted) return '';
        return formatOrderDateTime(order.created_at);
    }, [order.created_at, mounted]);

    const pickupTimeFormatted = React.useMemo(() => {
        if (!mounted || !order.customer_pickup_datetime?.trim()) return null;
        return formatOrderDateTime(order.customer_pickup_datetime);
    }, [order.customer_pickup_datetime, mounted]);

    const orderNotesTrimmed =
        typeof order.notes === 'string' ? order.notes.trim() : '';

    const addressDisplay =
        typeof order.address === 'string' && order.address.trim()
            ? order.address.trim()
            : '—';

    const details = [
        { label: t('orderNumber'), value: `#${order.id}` },
        {
            label: t('status'),
            value: getOrderStatusPresentation(
                tOrders,
                order.status,
                order.status_label,
            ).label,
        },
        { label: t('createdAt'), value: formattedDate },
        { label: t('deliveryMethod'), value: order.fulfillment_label },
        {
            label: t('address'),
            value: (
                <span className="block text-right wrap-break-word">
                    {addressDisplay}
                </span>
            ),
        },
        ...(pickupTimeFormatted
            ? [
                  {
                      label: t('pickupTime'),
                      value: pickupTimeFormatted,
                  },
              ]
            : [
                  {
                      label: t('deliveryTime'),
                      value: t('asap'),
                  },
              ]),
        ...(orderNotesTrimmed
            ? [
                  {
                      label: t('notes'),
                      value: (
                          <span className="block text-right wrap-break-word">
                              {orderNotesTrimmed}
                          </span>
                      ),
                  },
              ]
            : []),
        {
            label: t('totalAmount'),
            value: (
                <div className="flex items-center gap-1 justify-end font-semibold text-gray-900">
                    <span>{formatMoneyAmount(order.total, locale)}</span>
                    <CurrencySymbol className="w-3.5 h-3.5" />
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center md:text-start">
                {t('title')}
            </h3>

            <div className="flex flex-col gap-4">
                {details.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 last:border-none last:pb-0">
                        <span className="text-sm font-medium text-gray-500 shrink-0">
                            {item.label}
                        </span>
                        <div className="text-sm font-semibold text-gray-900 text-right">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
