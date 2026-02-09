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

export type PaymentMethodSlug = 'cod' | 'wallet' | 'epayment';

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
    custom_fields: Record<string, unknown>;
    variant_options: unknown[];
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
    use_wallet?: boolean;
    customer_pickup_datetime?: string | null;
    notes?: string;
    /** Required for epayment: from init payment_methods[].epayment_methods[].id */
    epayment_method_id?: number;
    /** Redirect after successful payment (epayment only) */
    success_url?: string;
    /** Redirect after failed payment (epayment only) */
    error_url?: string;
}

export interface CreateOrderResponse {
    id?: number;
    order_number?: string;
    status?: OrderStatus;
    status_label?: string;
    total?: number;
    estimated_delivery_time?: string;
    payment_method?: PaymentMethodSlug;
    created_at?: string;
    /** Epayment: redirect user to this URL */
    redirect_url?: string;
    /** Epayment: use for payment-status check after return */
    attempt_id?: number;
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
    gateways?: PaymentGateway[]; // legacy / non-checkout use
    max_amount?: number; // for cod
    can_combine?: boolean; // for wallet
    /** From checkout init: list of gateway options (e.g. Visa, Apple Pay) */
    epayment_methods?: EpaymentMethodOption[];
}

/** Single option under epayment (e.g. Visa/Mastercard, Apple Pay) */
export interface EpaymentMethodOption {
    id: number;
    name_ar: string;
    name_en: string;
    code: string;
    image_url: string | null;
    service_charge: number;
    total_amount: number;
    currency: string;
}

/** Request for POST /store/orders/init */
export interface CheckoutInitRequest {
    fulfillment_method: FulfillmentMethod;
    address_id?: number;
}

/** Cart as returned inside checkout init (may include branch_id, total_quantity) */
export interface CheckoutInitCartItem {
    id: number;
    product: {
        id: number;
        title: string;
        slug: string;
        price: number;
        sale_price: number | null;
        cover_image_url: string;
        is_available: boolean;
        type: string;
        categories?: Array<{ id: number; name: string; slug?: string }>;
    };
    variant: { id: number; title: string; price: number } | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    addons: unknown[] | null;
    addons_price: number;
    total_price: number;
    custom_fields: Record<string, unknown> | null;
    variant_options: Record<string, string> | null;
    notes: string | null;
    is_available: boolean;
    available_quantity: number | null;
}

export interface CheckoutInitCart {
    id: number;
    branch_id?: number;
    status: string;
    items: CheckoutInitCartItem[];
    items_count: number;
    total_quantity: number;
    subtotal: number;
    total_addons_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}

export interface CheckoutInitAddress {
    id: number;
    label: string;
    is_default: boolean;
    country_id: number;
    city_id: number;
    district_id: number | null;
    recipient_name: string | null;
    phone: string | null;
    country: string;
    city: string;
    district: string | null;
    street: string;
    building_number: string | null;
    unit_number: string | null;
    postal_code: string | null;
    latitude: number | null;
    longitude: number | null;
    additional_number: string | null;
    notes: string | null;
}

export interface CheckoutInitFulfillmentMethod {
    value: number;
    label: string;
    description: string;
    requires_address: boolean;
    requires_pickup_datetime: boolean;
}

export interface CheckoutInitSummary {
    items_subtotal: number;
    shipping_fee: number;
    cod_fee: number;
    tax_amount: number;
    total: number;
}

export interface CheckoutInitSettings {
    min_order_amount: number;
    free_delivery_threshold: number;
    allow_order_notes: boolean;
    allow_scheduled_orders: boolean;
}

export interface CheckoutInitWallet {
    balance: number;
    is_active: boolean;
}

export interface CheckoutInitCartIssue {
    item_id?: number;
    product_id?: number;
    message?: string;
    [key: string]: unknown;
}

/** Response from POST /store/orders/init */
export interface CheckoutInitResponse {
    cart: CheckoutInitCart;
    cart_valid: boolean;
    cart_issues: CheckoutInitCartIssue[];
    cart_warnings: CheckoutInitCartIssue[];
    addresses: CheckoutInitAddress[];
    fulfillment_methods: CheckoutInitFulfillmentMethod[];
    payment_methods: PaymentMethod[];
    wallet: CheckoutInitWallet;
    summary: CheckoutInitSummary;
    settings: CheckoutInitSettings;
    shipping_options?: Array<{ value: number; label: string; description: string; fee: number }>;
}

/** Response from GET /store/orders/payment-status/{attemptId} */
export interface PaymentStatusResponse {
    attempt_id: number;
    status: number;
    status_label: string;
    order_id?: number;
    amount?: number;
    currency?: string;
    payment_date?: string;
}
