/**
 * Cart-related types matching the API responses
 */

/**
 * Addon item in cart (from API response)
 */
export interface CartAddon {
    addon_item_id: number;
    addon_group_name: string | null;
    addon_item_name: string;
    quantity: number;
    price: number;
    multiply_by_quantity: boolean;
}

/**
 * Addon item for adding to cart (request format)
 */
export interface AddCartAddon {
    addon_item_id: number;
    quantity: number;
}

/**
 * Cart item from API response
 */
export interface ApiCartItem {
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
    };
    variant: {
        id: number;
        name: string;
        price: number;
    } | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    addons: CartAddon[] | null;
    addons_price: number;
    total_price: number;
    custom_fields: Record<string, any> | null;
    variant_options: Record<string, string> | null;
    notes: string | null;
    is_available: boolean;
    available_quantity: number | null;
}

/**
 * Full cart response from API
 */
export interface ApiCart {
    id: number;
    status: string;
    items: ApiCartItem[];
    items_count: number;
    subtotal: number;
    total_addons_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}

/**
 * Guest cart item for merge request
 */
export interface GuestCartItem {
    product_id: number;
    product_variant_id?: number | null;
    quantity: number;
    addons?: AddCartAddon[];
    custom_fields?: Record<string, any>;
    variant_options?: Record<string, string>;
    notes?: string;
}

/**
 * Request body for adding item to cart
 */
export interface AddCartItemRequest {
    product_id: number;
    product_variant_id?: number | null;
    quantity: number;
    addons?: AddCartAddon[];
    custom_fields?: Record<string, any>;
    variant_options?: Record<string, string>;
    notes?: string;
}

/**
 * Request body for updating cart item
 */
export interface UpdateCartItemRequest {
    quantity?: number;
    addons?: AddCartAddon[];
    custom_fields?: Record<string, any>;
    notes?: string;
}

/**
 * Request body for merging guest cart
 */
export interface MergeGuestCartRequest {
    guest_cart: GuestCartItem[];
}

/**
 * Cart validation response
 */
export interface CartValidationResponse {
    is_valid: boolean;
    issues: Array<{
        item_id: number;
        product_id: number;
        product_name: string;
        issue: string;
        message: string;
    }>;
    warnings: Array<{
        item_id: number;
        product_id: number;
        product_name: string;
        warning: string;
        message: string;
    }>;
}
