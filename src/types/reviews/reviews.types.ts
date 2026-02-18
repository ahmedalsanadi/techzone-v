// src/types/reviews/reviews.types.ts

export enum ReviewTypeEnum {
    PRODUCT = 1,
    SHIPPING = 2,
    STORE = 3,
    ORDER = 4,
}

export type ReviewType = 'product' | 'shipping' | 'store' | 'order';

export interface Review {
    id: number;
    rating: number;
    comment: string | null;
    customer_name: string;
    created_at: string;
    created_at_human: string;
    order_id: number;
    order_item_id?: number | null;
    status?: 'pending' | 'approved' | 'rejected';
    reviewable?: {
        type: string;
        id: number;
        name: string;
        slug: string;
        image: string | null;
    };
    merchant_reply?: {
        content: string;
        replied_at: string;
        replied_at_human: string;
    };
}

export interface CreateReviewRequest {
    order_id: number;
    product_id?: number;
    type: ReviewTypeEnum;
    rating: number;
    comment?: string | null;
}

export interface UpdateReviewRequest {
    rating?: number;
    comment?: string;
}

export interface CanReviewResponse {
    can_review: boolean;
    order_id?: number;
    order_item_id?: number;
    reason?: 'not_purchased' | 'already_reviewed' | string;
}
