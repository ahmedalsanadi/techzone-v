// src/app/[locale]/my-orders/utils/components/ReportProblemView.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { OrderSummaryCard } from './OrderSummaryCard';
import { Order } from '@/types/orders';
import { ReportProblemForm } from './ReportProblemForm';
import SubHeaderManager from '@/components/layouts/SubHeaderManager';

interface ReportProblemViewProps {
    order: Order;
}

export default function ReportProblemView({ order }: ReportProblemViewProps) {
    const t = useTranslations('ReportProblem');
    const tOrders = useTranslations('Orders');

    const breadcrumbItems = [
        { label: tOrders('navigation.home'), href: '/' },
        { label: tOrders('navigation.myOrders'), href: '/my-orders' },
        {
            label: tOrders('orderNumber', { number: order.id }),
            href: `/my-orders/${order.id}`,
        },
        { label: t('title'), active: true },
    ];

    return (
            <section className="space-y-6 py-2">
                <Breadcrumbs items={breadcrumbItems} />
                <SubHeaderManager show={false} />

                <div className="mt-8 mb-12">
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                        {t('title')}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Sidebar: Order Details (Right side in RTL) */}
                    <div className="space-y-6">
                        <OrderSummaryCard order={order} />
                    </div>

                    {/* Main Content: Problem Form (Left side in RTL) */}
                    <div className="lg:col-span-2">
                        <ReportProblemForm />
                    </div>
                </div>
            </section>
    );
}
