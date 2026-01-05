import React from 'react';
import MyOrdersIndex from '@/components/pages/orders/MyOrdersIndex';
import { getOrders } from '@/lib/mock-data';

export default async function MyOrdersPage() {
    // Simulate fetching orders from an API
    const orders = await getOrders();

    return <MyOrdersIndex orders={orders} />;
}
