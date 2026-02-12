import React from 'react';
import OrderCardSkeleton from '@/components/orders/OrderCardSkeleton';

export default function Loading() {
    return (
        <section className="min-h-screen pb-16 pt-6 px-2 md:px-4">
            <div className="flex items-center justify-start my-4 md:my-12">
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
        </section>
    );
}

