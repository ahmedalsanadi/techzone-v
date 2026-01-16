// src/app/[locale]/my-orders/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getOrderById } from '../utils/services/order-services';
import OrderDetailsView from '../utils/components/OrderDetailsView';

export default async function OrderPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const {id } = await params;

    // Simulate fetching orders from an API
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }
    return <OrderDetailsView order={order} />;
}
