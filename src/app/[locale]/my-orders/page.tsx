
import MyOrdersView from './utils/components/MyOrdersView';
import { getOrders } from './utils/services/order-services';


export default async function MyOrdersPage() {
    // Simulate fetching orders from an API
    const orders = await getOrders();

    return <MyOrdersView orders={orders} />;
}
