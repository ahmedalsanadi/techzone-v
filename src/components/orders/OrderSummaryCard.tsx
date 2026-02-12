// src/app/[locale]/my-orders/utils/components/OrderSummaryCard.tsx
'use client';

import React from 'react';
import { Order } from '@/types/orders';
import { formatCurrency } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface OrderSummaryCardProps {
    order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    const t = useTranslations('Orders.summary');
    const locale = useLocale();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const formattedDate = React.useMemo(() => {
        if (!mounted) return '';
        try {
            return new Date(order.created_at).toLocaleString('ar-SA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (e) {
            return order.created_at;
        }
    }, [order.created_at, mounted]);

    const details = [
        { label: t('orderNumber'), value: `#${order.id}` },
        { label: t('status'), value: order.status_label },
        { label: t('createdAt'), value: formattedDate },
        { label: t('deliveryMethod'), value: order.fulfillment_label },
        {
            label: t('address'),
            value: (
                <div className="flex flex-col items-end text-right">
                    <span className="font-semibold text-gray-900 leading-tight">
                        {order.fulfillment_label}
                    </span>
                    <span className="text-xs text-gray-500 font-medium leading-tight mt-1">
                        {order.metadata?.notes || order.notes || ''}
                    </span>
                </div>
            ),
        },
        {
            label: t('deliveryTime'),
            value: order.customer_pickup_datetime || t('asap'),
        },
        {
            label: t('totalAmount'),
            value: (
                <div className="flex items-center gap-1 justify-end font-semibold text-gray-900">
                    <span>{formatCurrency(order.total, locale)}</span>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm">
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
