// src/app/[locale]/my-orders/utils/components/OrderSummaryCard.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Order } from '../services/order-services';
import CurrencySymbol from '@/components/ui/CurrencySymbol';

interface OrderSummaryCardProps {
    order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    const t = useTranslations('Orders.summary');

    const details = [
        { label: t('orderNumber'), value: `#${order.orderNumber}` },
        { label: t('createdAt'), value: order.createdAt },
        { label: t('deliveryMethod'), value: order.deliveryMethod },
        {
            label: t('address'),
            value: (
                <div className="flex flex-col items-end text-right">
                    <span className="font-semibold text-gray-900 leading-tight">
                        {order.deliveryLocation}
                    </span>
                    <span className="text-xs text-gray-500 font-medium leading-tight mt-1">
                        {order.address}
                    </span>
                </div>
            ),
        },
        { label: t('deliveryTime'), value: order.deliveryTime },
        {
            label: t('totalAmount'),
            value: (
                <div className="flex items-center gap-1 justify-end font-semibold text-gray-900">
                    <span>{order.totalAmount.toFixed(2)}</span>
                    <CurrencySymbol className="w-4 h-4" />
                </div>
            ),
        },
        {
            label: t('paymentMethod'),
            value: (
                <div className="flex items-center gap-2 justify-end">
                    <Image
                        src="/images/badges/mada-pay-badge.svg"
                        alt="Mada"
                        width={44}
                        height={16}
                        className="h-4 w-auto object-contain"
                    />
                    <Image
                        src="/images/badges/master-pay-badge.svg"
                        alt="Mastercard"
                        width={32}
                        height={20}
                        className="h-5 w-auto object-contain opacity-80"
                    />
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
