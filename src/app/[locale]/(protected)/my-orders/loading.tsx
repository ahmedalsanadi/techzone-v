import React from 'react';
import OrderCardSkeleton from '@/components/orders/order-list/OrderCardSkeleton';

export default function Loading() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-start">
                <div className="h-8 w-48 rounded bg-gray-100 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                <OrderCardSkeleton />
                <OrderCardSkeleton />
                <OrderCardSkeleton />
                <OrderCardSkeleton />
            </div>

            <div className="flex justify-center mt-12">
                <div className="h-12 w-[200px] rounded-xl bg-gray-100 animate-pulse" />
            </div>
        </div>
    );
}
