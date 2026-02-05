// src/types/orders.ts

export type OrderStatus =
    | 'WAITING_APPROVAL'
    | 'WAITING_PAYMENT'
    | 'PREPARING'
    | 'READY'
    | 'PICKED_UP'
    | 'ON_THE_WAY'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REJECTED'
    | number; // Added to handle numeric status codes from API

export enum FulfillmentMethod {
    DELIVERY = 1,
    PICKUP = 2,
    CURBSIDE = 3,
    DINE_IN = 4,
}

export type PaymentMethodSlug = 'cod' | 'wallet' | 'card';

export interface OrderItemAddon {
    addon_item_id: number;
    price: number;
    quantity: number;
    multiply_by_quantity?: boolean;
    name?: string; // Optional since it might be missing in some responses
}

export interface OrderItem {
    id: number;
    product_id: number;
    product_variant_id: number | null;
    product_title: string;
    product_type: string | number;
    is_variation: boolean;
    quantity: number;
    unit_price: number;
    sale_unit_price: number;
    total_price: number;
    total_discount: number;
    tax_rate: number;
    total_tax: number;
    addons: OrderItemAddon[];
    custom_fields: Record<string, any>;
    variant_options: any[];
    notes: string | null;
    status: string;
    status_label: string;
    product_image: string | null;
}

export interface Order {
    id: number;
    branch_id: number;
    branch_name: string;
    status: OrderStatus;
    status_label: string;
    fulfillment_method: FulfillmentMethod;
    fulfillment_label: string;
    items_count: number;
    total_quantity: number;
    items_subtotal: number;
    items_discount: number;
    items_total: number;
    items_tax?: number;
    shipping_fee: number;
    cod_fee: number;
    subtotal: number;
    total: number;
    wallet_deduction: number;
    customer_pickup_datetime: string | null;
    items?: OrderItem[];
    metadata?: {
        address_id?: number;
        notes?: string;
    };
    address_id?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    review?: {
        rate: number;
        comment: string | null;
    };
    customer?: {
        id: number;
        name: string;
        phone: string;
    };
    timeline?: OrderStatusUpdate[];
}

export interface OrderStatusUpdate {
    status: string;
    label: string;
    timestamp?: string;
    active: boolean;
    completed: boolean;
}

export interface CreateOrderRequest {
    fulfillment_method: FulfillmentMethod;
    address_id?: number;
    payment_method: PaymentMethodSlug;
    use_wallet?: boolean; // Added for combinable payment
    customer_pickup_datetime?: string | null;
    notes?: string;
}

export interface CreateOrderResponse {
    id: number;
    order_number: string;
    status: OrderStatus;
    status_label: string;
    total: number;
    estimated_delivery_time?: string;
    payment_method: PaymentMethodSlug;
    created_at: string;
}

export interface PaymentGateway {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo: string | null;
    supports_libero: boolean;
    supports_direct: boolean;
}

export type PaymentMethodType = 'epayment' | 'cod' | 'wallet';

export interface PaymentMethod {
    type: PaymentMethodType;
    name: string;
    description: string;
    icon: string;
    available: boolean;
    gateways?: PaymentGateway[]; // for epayment
    max_amount?: number; // for cod
    can_combine?: boolean; // for wallet
}
