// will contain getting order by id and getting all orders
export interface Order {
    id: string;
    orderNumber: string;
    branchName: string;
    createdAt: string;
    deliveryLocation: string;
    totalAmount: number;
    rating: number;
    status: 'delivered' | 'waiting';
}

const mockOrders: Order[] = [
    {
        id: '1',
        orderNumber: '2431',
        branchName: 'النخيل',
        createdAt: '22/11/2025, 10:00 م',
        deliveryLocation: 'للمنزل',
        totalAmount: 35.0,
        rating: 4.5,
        status: 'delivered',
    },
    {
        id: '2',
        orderNumber: '2431',
        branchName: 'النخيل',
        createdAt: '22/11/2025, 10:00 م',
        deliveryLocation: 'للمنزل',
        totalAmount: 35.0,
        rating: 4.5,
        status: 'waiting',
    },
    {
        id: '3',
        orderNumber: '2431',
        branchName: 'النخيل',
        createdAt: '22/11/2025, 10:00 م',
        deliveryLocation: 'للمنزل',
        totalAmount: 35.0,
        rating: 4.5,
        status: 'waiting',
    },
    {
        id: '4',
        orderNumber: '2431',
        branchName: 'النخيل',
        createdAt: '22/11/2025, 10:00 م',
        deliveryLocation: 'للمنزل',
        totalAmount: 35.0,
        rating: 4.5,
        status: 'waiting',
    },
];

export async function getOrders(): Promise<Order[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockOrders;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockOrders.find((order) => order.id === id);
}
