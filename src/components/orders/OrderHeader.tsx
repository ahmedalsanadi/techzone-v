'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Star, X, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { Order, ORDER_STATUS_NUMBER_MAP } from '@/types/orders/orders.types';

interface OrderHeaderProps {
    order: Order;
}

export function OrderHeader({ order }: OrderHeaderProps) {
    const t = useTranslations('Orders');
    const statusKey =
        typeof order.status === 'number'
            ? ORDER_STATUS_NUMBER_MAP[order.status] ?? 'WAITING_APPROVAL'
            : order.status;
    const isCanceled = statusKey === 'CANCELED';

    return (
        <div className="flex flex-col gap-4 mb-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link href="/" className="hover:text-primary transition-colors">
                    {t('navigation.home')}
                </Link>
                <span>›</span>
                <Link
                    href="/my-orders"
                    className="hover:text-primary transition-colors">
                    {t('navigation.myOrders')}
                </Link>
                <span>›</span>
                <span className="text-gray-900">
                    {t('orderNumber', { number: order.id })}
                </span>
            </nav>

            {/* Title and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                    {t('orderNumberTitle', { number: order.id })}
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-bold gap-2">
                        <Star className="w-4 h-4" />
                        {t('actions.rateOrder')}
                    </Button>
                    {!isCanceled && (
                        <Button
                            variant="outline"
                            className="h-10 px-4 rounded-xl border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-bold gap-2">
                            <X className="w-4 h-4" />
                            {t('actions.cancelOrder')}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-bold gap-2">
                        <RotateCcw className="w-4 h-4" />
                        {t('actions.reorder')}
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-bold gap-2">
                        <Info className="w-4 h-4" />
                        {t('actions.reportProblem')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
