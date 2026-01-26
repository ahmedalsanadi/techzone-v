// src/app/[locale]/my-orders/utils/components/OrderDetailsView.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Star, X, RotateCcw, Info } from 'lucide-react';
import SubHeaderManager from '@/components/layouts/SubHeaderManager';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { Order } from '../services/order-services';
import { OrderCourierCard } from './OrderCourierCard';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { OrderSummaryCard } from './OrderSummaryCard';
import { OrderProductsCard } from './OrderProductsCard';

interface OrderDetailsViewProps {
    order: Order;
}

export default function OrderDetailsView({ order }: OrderDetailsViewProps) {
    const t = useTranslations('Orders');

    return (
        <section className="min-h-screen pb-16 pt-6 px-1 md:px-4 space-y-6">
            {/* Manage SubHeader (Client Logic) */}
            <SubHeaderManager show={false} />

            {/* Breadcrumbs - Placed at the very top right */}
            <div className="flex justify-start mb-6">
                <nav className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                    <Link
                        href="/"
                        className="hover:text-primary transition-colors">
                        {t('navigation.home')}
                    </Link>
                    <span className="text-[10px] opacity-50">•</span>
                    <Link
                        href="/my-orders"
                        className="hover:text-primary transition-colors">
                        {t('navigation.myOrders')}
                    </Link>
                    <span className="text-[10px] opacity-50">•</span>
                    <span className="text-gray-900 font-bold">
                        {t('orderNumber', { number: order.orderNumber })}
                    </span>
                </nav>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                {/* Order Title */}
                <div className="flex items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        {t('orderNumberTitle', {
                            number: order.orderNumber,
                        })}
                    </h1>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <Link href={`/my-orders/${order.id}/report-problem`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full md:w-auto">
                            <Info className="w-4 h-4" />
                            <span className="truncate">
                                {t('actions.reportProblem')}
                            </span>
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto">
                        <Star className="w-4 h-4" />
                        <span className="truncate">
                            {t('actions.rateOrder')}
                        </span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto">
                        <RotateCcw className="w-4 h-4" />
                        <span className="truncate">{t('actions.reorder')}</span>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full md:w-auto">
                        <X className="w-4 h-4" />
                        <span className="truncate">
                            {t('actions.cancelOrder')}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Right Column: Main Content */}
                <div className="flex flex-col gap-6 col-span-1 md:col-span-7">
                    <OrderSummaryCard order={order} />
                    <OrderProductsCard items={order.items} />
                </div>
                {/* Right Column: Main Content */}
                <div className="flex flex-col gap-6 col-span-1 md:col-span-5">
                    <OrderCourierCard />
                    <OrderStatusTimeline timeline={order.timeline} />
                </div>
            </div>
        </section>
    );
}
