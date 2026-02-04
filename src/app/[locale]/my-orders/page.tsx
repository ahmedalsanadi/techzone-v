import MyOrdersView from './utils/components/MyOrdersView';
import { orderService } from '@/services/order-service';

export default async function MyOrdersPage() {
    // Fetch orders from the real API
    const response = await orderService.getOrders({ page: 1, per_page: 10 });
    const orders = response.data || [];
    const meta = response.meta;

    return <MyOrdersView initialOrders={orders} initialMeta={meta} />;
}
