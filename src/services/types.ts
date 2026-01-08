//src/services/types.ts
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface StoreTheme {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
}

export interface AppVersion {
    current: string;
    minimum: string;
    force_update: boolean;
    update_message: string;
}

export interface SocialChannel {
    icon: string;
    link: string;
    type: string;
    title: string;
    status: boolean;
}

export interface StoreInfo {
    name: string;
    slogan: string;
    logo_url: string;
    default_language: string;
    default_currency: string;
    support_channels: Array<{
        type: string;
        value: string;
        title: string;
    }> | null;
    social_channels: SocialChannel[];
    products_type: string;
    store_type: string;
}

export interface StoreFeatures {
    cart: boolean;
    wishlist: boolean;
    reviews: boolean;
    coupons: boolean;
    loyalty_points: boolean;
    guest_checkout: boolean;
}

export interface HomeSections {
    banners: unknown[];
    show_categories: boolean;
    show_featured_products: boolean;
    show_offers: boolean;
    show_new_arrivals: boolean;
    sections_order: string[];
}

export interface CheckoutSettings {
    min_order_amount: number;
    delivery_fee: number;
    free_delivery_threshold: number;
    tax_rate: number;
    tax_included: boolean;
    allow_order_notes: boolean;
    allow_scheduled_orders: boolean;
}

export interface Category {
    id: number | string;
    name: string;
    slug: string | null;
    description?: string;
    image_url?: string | null;
    icon_url?: string | null;
    show_in_menu?: boolean;
    children?: Category[];
    parent_id?: number | string | null;
}

export interface StoreConfig {
    theme: StoreTheme;
    app_version: AppVersion;
    store: StoreInfo;
    features: StoreFeatures;
    home_sections: HomeSections;
    checkout: CheckoutSettings;
}

export interface ProductVariety {
    id: string | number;
    name: string;
    price: number;
    originalPrice?: number;
    calories?: number;
    prepTime?: number;
    isDefault?: boolean;
}

export interface ProductAddon {
    id: string | number;
    name: string;
    price: number;
}

export interface ProductSauce {
    id: string | number;
    name: string;
    price: number;
}

export interface ProductAllergy {
    name: string;
    icon: string;
}

export interface Product {
    id: number;
    title: string;
    subtitle?: string;
    description: string;
    slug: string;
    cover_image_url: string;
    image_urls: string[];
    price: number;
    sale_price?: number;
    has_discount: boolean;
    is_available: boolean;
    calories?: number;
    prepTime?: number;
    categories: Array<{ id: number; name: string }>;
    variants: any[];
    addons: Array<{
        id: number;
        name: string;
        description: string;
        input_type: 'boolean' | 'number';
        min_selected: number;
        max_selected: number;
        is_required: boolean;
        items: Array<{
            id: number;
            title: string;
            extra_price: number;
            max_quantity?: number;
            multiply_price_by_quantity: boolean;
        }>;
    }>;
}
