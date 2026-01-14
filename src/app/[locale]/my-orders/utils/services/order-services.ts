export type OrderStatus =
    | 'delivered'
    | 'waiting'
    | 'preparing'
    | 'with_courier'
    | 'cancelled';

export interface OrderItem {
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    addons: string[];
}

export interface OrderStatusUpdate {
    status: string;
    label: string;
    timestamp?: string;
    active: boolean;
    completed: boolean;
}

export interface Order {
    id: string;
    orderNumber: string;
    branchName: string;
    createdAt: string;
    deliveryLocation: string;
    deliveryMethod: string;
    address: string;
    deliveryTime: string;
    totalAmount: number;
    rating: number;
    status: OrderStatus;
    paymentMethod: 'mada' | 'cash' | 'credit_card';
    items: OrderItem[];
    timeline: OrderStatusUpdate[];
}

const mockOrders: Order[] = [
    {
        id: '1',
        orderNumber: '2431',
        branchName: 'النخيل',
        createdAt: '22/11/2025، 10:00 م',
        deliveryLocation: 'للمنزل',
        deliveryMethod: 'توصيل إلى موقعي',
        address: 'حي اليرموك، شارع النجاح، منزل رقم 42، الرياض 13243',
        deliveryTime: '29/11/2025، 10:00 م',
        totalAmount: 35.0,
        rating: 4.5,
        status: 'with_courier',
        paymentMethod: 'mada',
        items: [
            {
                id: 'p1',
                name: 'مارجريتا وسط',
                image: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=800',
                price: 35,
                originalPrice: 40,
                quantity: 1,
                addons: [
                    'صوص طماطم طازج (4) 5 ﷼',
                    'صوص طماطم طازج (4) 5 ﷼',
                    'صوص طماطم طازج (4) 5 ﷼',
                    'صوص طماطم طازج (4) 5 ﷼',
                    'صوص طماطم طازج (4) 5 ﷼',
                ],
            },
        ],
        timeline: [
            {
                status: 'created',
                label: 'تم انشاء الطلب',
                timestamp: '22/11/2025، 10:00 م',
                active: false,
                completed: true,
            },
            {
                status: 'approved',
                label: 'في انتظار الموافقة',
                active: false,
                completed: true,
            },
            {
                status: 'preparing',
                label: 'قيد التحضير',
                active: false,
                completed: true,
            },
            {
                status: 'with_courier',
                label: 'مع المندوب',
                timestamp: '22/11/2025، 10:10 م',
                active: true,
                completed: false,
            },
            {
                status: 'delivered',
                label: 'تم التوصيل',
                active: false,
                completed: false,
            },
        ],
    },
    {
        id: '2',
        orderNumber: '2432',
        branchName: 'النخيل',
        createdAt: '22/11/2025، 11:00 م',
        deliveryLocation: 'للمنزل',
        deliveryMethod: 'توصيل إلى موقعي',
        address: 'حي اليرموك، شارع النجاح، منزل رقم 42، الرياض 13243',
        deliveryTime: '29/11/2025، 11:00 م',
        totalAmount: 45.0,
        rating: 5.0,
        status: 'delivered',
        paymentMethod: 'mada',
        items: [
            {
                id: 'p1',
                name: 'مارجريتا وسط',
                image: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=800',
                price: 35,
                quantity: 1,
                addons: [],
            },
        ],
        timeline: [
            {
                status: 'created',
                label: 'تم انشاء الطلب',
                timestamp: '22/11/2025، 10:00 م',
                active: false,
                completed: true,
            },
            {
                status: 'approved',
                label: 'في انتظار الموافقة',
                active: false,
                completed: true,
            },
            {
                status: 'preparing',
                label: 'قيد التحضير',
                active: false,
                completed: true,
            }
        ],
    },
    {
        id: '3',
        orderNumber: '2433',
        branchName: 'النخيل',
        createdAt: '22/11/2025، 12:00 م',
        deliveryLocation: 'للمنزل',
        deliveryMethod: 'توصيل إلى موقعي',
        address: 'حي اليرموك، شارع النجاح، منزل رقم 42، الرياض 13243',
        deliveryTime: '29/11/2025، 12:00 م',
        totalAmount: 25.0,
        rating: 4.0,
        status: 'waiting',
        paymentMethod: 'mada',
        items: [
            {
                id: 'p1',
                name: 'مارجريتا وسط',
                image: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=800',
                price: 35,
                quantity: 1,
                addons: [],
            },
        ],
        timeline: [],
    },
    {
        id: '4',
        orderNumber: '2434',
        branchName: 'النخيل',
        createdAt: '22/11/2025، 01:00 م',
        deliveryLocation: 'للمنزل',
        deliveryMethod: 'توصيل إلى موقعي',
        address: 'حي اليرموك، شارع النجاح، منزل رقم 42، الرياض 13243',
        deliveryTime: '29/11/2025، 01:00 م',
        totalAmount: 55.0,
        rating: 4.8,
        status: 'preparing',
        paymentMethod: 'mada',
        items: [
            {
                id: 'p1',
                name: 'مارجريتا وسط',
                image: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?auto=format&fit=crop&q=80&w=800',
                price: 35,
                quantity: 1,
                addons: [],
            },
        ],
        timeline: [],
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
