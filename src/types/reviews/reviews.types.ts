// src/types/reviews/reviews.types.ts
export type ReviewType = 'product' | 'shipping' | 'store' | 'order';

export interface Review {
    id: number;
    user_id: number;
    user_name: string;
    product_id: number | null;
    order_id: number | null;
    rating: number;
    comment: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface CreateReviewRequest {
    order_id: number;
    product_id: number;
    rating: number;
    comment?: string;
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
