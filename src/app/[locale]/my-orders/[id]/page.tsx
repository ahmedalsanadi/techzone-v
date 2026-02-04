// src/app/[locale]/my-orders/[id]/page.tsx
import { notFound } from 'next/navigation';
import { orderService } from '@/services/order-service';
import OrderDetailsView from '../utils/components/OrderDetailsView';

export default async function OrderPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { id } = await params;

    try {
        const order = await orderService.getOrder(id);
        if (!order) {
            notFound();
        }
        return <OrderDetailsView order={order} />;
    } catch (error) {
        notFound();
    }
}
