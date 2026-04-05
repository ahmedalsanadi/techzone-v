'use client';

import { useTranslations } from 'next-intl';
import type { Order } from '@/types/orders';
import type { PaginationMeta } from '@/types/api';
import OrderCard from './OrderCard';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import OrderCardSkeleton from './OrderCardSkeleton';
import { useOrdersList } from '@/hooks/orders';

interface MyOrdersViewProps {
    initialOrders: Order[];
    initialMeta?: PaginationMeta;
}

export default function MyOrdersView({
    initialOrders,
    initialMeta,
}: MyOrdersViewProps) {
    const t = useTranslations('Orders');
    const { orders, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useOrdersList({ initialOrders, initialMeta });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-start">
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
                {isFetchingNextPage && (
                    <>
                        <OrderCardSkeleton />
                        <OrderCardSkeleton />
                    </>
                )}
            </div>

            {hasNextPage && (
                <div className="flex justify-center mt-12">
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outline"
                        className="min-w-[200px] h-12 rounded-xl font-bold border-2">
                        {isFetchingNextPage ? (
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
        </div>
    );
}
