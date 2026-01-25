import { fetchLibero, fetchLiberoFull } from './api';
import {
    StoreConfig,
    Product,
    PaginationMeta,
    Category,
    Collection,
} from './types';
import type { CustomerProfile, ProfileUpdateRequest } from '@/types/auth';

/**
 * Service for store-related data fetching.
 */
export const storeService = {
    /**
     * Get store configuration including theme and home sections.
     */
    getConfig: () =>
        fetchLibero<StoreConfig>('/store/config', {
            // next: {
            //     revalidate: 3600, // Cache for 1 hour
            //     tags: ['store-config'],
            // },
            next: { revalidate: 0 }, // No cache
        }),

    /**
     * Get all categories with optional tree structure.
     */
    getCategories: (tree: boolean = true) =>
        fetchLibero<Category[]>('/store/categories', {
            params: { tree },
            next: {
                revalidate: 3600, // Cache for 1 hour
                tags: ['categories'],
            },
        }),

    /**
     * List products with filtering and pagination.
     */
    async getProducts(
        params: Record<string, string | number | boolean | undefined> = {},
    ): Promise<{ data: Product[]; meta: PaginationMeta }> {
        const response = await fetchLiberoFull<Product[]>('/store/products', {
            params,
            next: { revalidate: 0 }, // Cache products for 5 minutes
        });

        const per_page = Number(params?.per_page) || 8;
        const total = response.meta?.total || response.data?.length || 0;

        return {
            data: response.data,
            meta: response.meta || {
                current_page: Number(params?.page) || 1,
                last_page: Math.ceil(total / per_page) || 1,
                per_page: per_page,
                total: total,
            },
        };
    },

    /**
     * Get a single product by Slug.
     */
    getProduct: (slug: string) =>
        fetchLibero<Product>(`/store/products/${slug}`, {
            next: { revalidate: 0 }, // Cache product for 5 minutes
        }),

    /**
     * Get category by Slug.
     */
    getCategory: (slug: string) =>
        fetchLibero<Category>(`/store/categories/${slug}`, {
            next: { revalidate: 3600 }, // Cache category for 1 hour
        }),

    /**
     * Get all collections/offers.
     */
    getCollections: () =>
        fetchLibero<Collection[]>('/store/collections', {
            next: {
                revalidate: 3600, // Cache collections for 1 hour
                tags: ['collections'],
            },
        }),

    /**
     * Get customer profile.
     * {
     * 
    "success": true,
    "message": "تم جلب الملف الشخصي بنجاح",
    "data": {
        "id": 12,
        "first_name": "احمد",
        "middle_name": null,
        "last_name": "علي",
        "full_name": "احمد  علي",
        "phone": "0501234561",
        "email": "ahmed2@example.com",
        "is_profile_complete": true,
        "is_phone_verified": true,
        "is_email_verified": false,
        "points": 0,
        "total_orders": 0,
        "total_spent": 0,
        "address": null,
        "last_login_at": "2026-01-16T21:28:22.000000Z",
        "created_at": "2026-01-16T21:27:06.000000Z"
    }
}
     */
    getProfile: () =>
        fetchLibero<CustomerProfile>('/store/profile', {
            isProtected: true,
        }),

    /**
     * Update customer profile.
     * {
     *
     * }
     */
    updateProfile: (data: ProfileUpdateRequest) =>
        fetchLibero<CustomerProfile>('/store/profile/update', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
        }),
};
