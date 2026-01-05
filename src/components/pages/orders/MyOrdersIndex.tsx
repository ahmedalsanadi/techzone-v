import React from 'react';
import { getTranslations } from 'next-intl/server';
import OrderCard from './OrderCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SubHeaderManager from '@/components/layouts/SubHeaderManager';
import { Order } from '@/lib/mock-data';

interface MyOrdersIndexProps {
    orders: Order[];
}

export default async function MyOrdersIndex({ orders }: MyOrdersIndexProps) {
    const t = await getTranslations('Orders');
    const commonT = await getTranslations('Product');
    return (
        
        <section className="min-h-screen pb-16 pt-6 px-2 md:px-4">
            {/* Manage SubHeader (Client Logic) */}
            <SubHeaderManager show={false} />

            {/*Title Section */}
                <div className="flex items-center justify-start my-4 md:my-12">
                    <h1 className="text-2xl font-black text-gray-900 border-s-4 border-[#B44B3A] ps-4">
                        {t('title')}
                    </h1>
                </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {orders.map((order, index) => (
                    <div
                        key={order.id}
                        className="h-full">
                        <OrderCard order={order} />
                    </div>
                ))}
            </div>
        </section>
    );
}
