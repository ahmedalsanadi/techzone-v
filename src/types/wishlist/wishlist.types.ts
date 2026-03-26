import type { ProductMedia } from '../store';

/**
 * Product information in wishlist item
 */
export interface WishlistProduct {
    id: number;
    title: string;
    slug: string;
    price: number;
    sale_price: number | null;
    cover_image_url: string;
    media?: ProductMedia;
    is_available: boolean;
    type: string;
}

/**
 * Wishlist item from API response
 */
export interface ApiWishlistItem {
    id: number;
    product: WishlistProduct | null;
    added_at: string;
}

/**
 * Wishlist response from API
 */
export interface ApiWishlist {
    success: boolean;
    message: string;
    data: ApiWishlistItem[];
    meta?: {
        total: number;
        count: number;
    };
}

/**
 * Request body for adding product to wishlist
 */
export interface AddWishlistItemRequest {
    product_id: number;
}

/**
 * Response for toggle wishlist action
 */
export interface ToggleWishlistResponse {
    action: 'added' | 'removed';
    wishlist_item?: ApiWishlistItem;
}

/**
 * Response for checking if product is in wishlist
 */
export interface CheckWishlistResponse {
    is_in_wishlist: boolean;
    wishlist_item_id: number | null;
    product_id: number;
}

/**
 * Guest wishlist item for merge request
 */
export interface GuestWishlistItem {
    product_id: number;
}
