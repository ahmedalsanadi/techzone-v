// src/app/[locale]/my-orders/utils/components/MyOrdersView.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import SubHeaderManager from '@/components/layouts/SubHeaderManager';
import { Order } from '@/types/orders';
import OrderCard from './OrderCard';
import { PaginationMeta } from '@/services/types';
import { orderService } from '@/services/order-service';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import OrderCardSkeleton from './OrderCardSkeleton';

interface MyOrdersViewProps {
    initialOrders: Order[];
    initialMeta?: PaginationMeta;
}

export default function MyOrdersView({
    initialOrders,
    initialMeta,
}: MyOrdersViewProps) {
    const t = useTranslations('Orders');
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [meta, setMeta] = useState<PaginationMeta | undefined>(initialMeta);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const handleLoadMore = async () => {
        if (!meta || meta.current_page >= meta.last_page || isLoadingMore)
            return;

        setIsLoadingMore(true);
        try {
            const nextPage = meta.current_page + 1;
            const response = await orderService.getOrders({
                page: nextPage,
                per_page: meta.per_page,
            });

            if (response.data) {
                setOrders((prev) => {
                    const newOrders = response.data || [];
                    const prevIds = new Set(prev.map((o) => o.id));
                    const uniqueNewOrders = newOrders.filter(
                        (o) => !prevIds.has(o.id),
                    );
                    return [...prev, ...uniqueNewOrders];
                });
                setMeta(response.meta);
            }
        } catch (error) {
            console.error('Failed to load more orders:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const hasMore = meta && meta.current_page < meta.last_page;

    return (
        <section className="min-h-screen pb-16 pt-6 px-2 md:px-4">
            <SubHeaderManager show={false} />

            <div className="flex items-center justify-start my-4 md:my-12">
                <h1 className="text-2xl font-black text-gray-900 border-s-4 border-theme-primary ps-4">
                    {t('title')}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {orders.map((order) => (
                    <div key={order.id} className="h-full">
                        <OrderCard order={order} />
                    </div>
                ))}
                {isLoadingMore && (
                    <>
                        <OrderCardSkeleton />
                        <OrderCardSkeleton />
                    </>
                )}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-12">
                    <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        variant="outline"
                        className="min-w-[200px] h-12 rounded-xl font-bold border-2">
                        {isLoadingMore ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            t('loadMore') || 'تحميل المزيد'
                        )}
                    </Button>
                </div>
            )}

            {orders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-gray-500 text-lg">
                        {t('noOrders') || 'لا توجد طلبات سابقة'}
                    </p>
                </div>
            )}
        </section>
    );
}
