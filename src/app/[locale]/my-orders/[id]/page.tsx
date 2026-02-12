// src/app/[locale]/my-orders/[id]/page.tsx
import { notFound } from 'next/navigation';
import { orderService } from '@/services/order-service';
import OrderDetailsView from '@/components/orders/OrderDetailsView';

export const dynamic = 'force-dynamic';

export default async function OrderPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { id } = await params;

    let order;
    try {
        order = await orderService.getOrder(id);
    } catch {
        notFound();
    }

    if (!order) {
        notFound();
    }

    return <OrderDetailsView order={order} />;
}
