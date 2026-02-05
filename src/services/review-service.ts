// src/services/review-service.ts
import { fetchLibero, fetchLiberoFull } from './api';
import {
    Review,
    CreateReviewRequest,
    UpdateReviewRequest,
    CanReviewResponse,
} from '@/types/reviews';
import { PaginationMeta } from './types';

export interface ReviewListParams {
    [key: string]: string | number | boolean | undefined;
    product_id?: number | string;
    my_reviews?: boolean;
    type?: string;
    rating?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

export const reviewService = {
    /**
     * List reviews with filters.
     */
    getReviews: (params?: ReviewListParams) =>
        fetchLiberoFull<Review[]>('/store/reviews', {
            params,
        }),

    /**
     * Add a new review.
     */
    addReview: (data: CreateReviewRequest) =>
        fetchLibero<Review>('/store/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
        }),

    /**
     * Update an existing review.
     */
    updateReview: (id: number | string, data: UpdateReviewRequest) =>
        fetchLibero<Review>(`/store/reviews/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            isProtected: true,
        }),

    /**
     * Delete a review.
     */
    deleteReview: (id: number | string) =>
        fetchLibero<{ success: boolean }>(`/store/reviews/${id}`, {
            method: 'DELETE',
            isProtected: true,
        }),

    /**
     * Check if a product can be reviewed.
     */
    canReview: (productId: number | string) =>
        fetchLibero<CanReviewResponse>('/store/reviews/can-review', {
            params: { product_id: productId },
            isProtected: true,
        }),
};
