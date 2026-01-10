//src/services/store-service.ts
import { cache } from 'react';
import { fetchLibero, fetchLiberoFull } from './api';
import {
    StoreConfig,
    Product,
    PaginationMeta,
    Category,
    Branch,
    Collection,
} from './types';

/**
 * Service for store-related data fetching.
 */
export const storeService = {
    /**
     * Get store configuration including theme and home sections.
     */
    getConfig: cache(() =>
        fetchLibero<StoreConfig>('/store/config', {
            next: {
                revalidate: 3600,
                tags: ['store-config'],
            },
        }),
    ),

    /**
     * Get all categories with optional tree structure.
     */
    getCategories: cache((tree: boolean = true) =>
        fetchLibero<Category[]>('/store/categories', {
            params: { tree },
            next: {
                revalidate: 3600,
                tags: ['categories'],
            },
        }),
    ),

    /**
     * List products with filtering and pagination.
     */
    async getProducts(
        params: Record<string, any> = {},
    ): Promise<{ data: Product[]; meta: PaginationMeta }> {
        const response = await fetchLiberoFull<Product[]>('/store/products', {
            params,
            next: { revalidate: 60 }, // Cache products for 1 minute
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
     * Get a single product by ID.
     */
    getProduct: (id: string) =>
        fetchLibero<Product>(`/store/products/${id}`, {
            next: { revalidate: 60 },
        }),

    /**
     * Get a single product by Slug.
     */
    getProductBySlug: (slug: string) =>
        fetchLibero<Product>(`/store/products/${slug}`, {
            next: { revalidate: 60 },
        }),

    /**
     * Get category by ID.
     */
    getCategory: (id: string) =>
        fetchLibero<Category>(`/store/categories/${id}`, {
            next: { revalidate: 3600 },
        }),

    /**
     * Get category by Slug.
     */
    getCategoryBySlug: (slug: string) =>
        fetchLibero<Category>(`/store/categories/${slug}`, {
            next: { revalidate: 3600 },
        }),

    /**
     * Get all branches with optional filters.
     */
    getBranches: (params: { type?: number; search?: string } = {}) =>
        fetchLibero<Branch[]>('/store/branches', {
            params,
            next: { revalidate: 3600 },
        }),

    /**
     * Get a single branch by ID.
     */
    getBranch: (id: string | number) =>
        fetchLibero<Branch>(`/store/branches/${id}`, {
            next: { revalidate: 3600 },
        }),

    /**
     * Get working hours for a branch.
     * TODO: Uncomment when backend endpoint is ready
     * Expected endpoint: GET /store/branches/{id}/working-hours
     */
    // getBranchWorkingHours: (id: string | number) =>
    //     fetchLibero<{
    //         schedule: Array<{
    //             day: string;
    //             hours: string[];
    //             closed?: boolean;
    //         }>;
    //     }>(`/store/branches/${id}/working-hours`, {
    //         next: { revalidate: 3600 },
    //     }),

    /**
     * Get all collections/offers.
     */
    getCollections: cache(() =>
        fetchLibero<Collection[]>('/store/collections', {
            next: {
                revalidate: 3600, // Cache for 1 hour
                tags: ['collections'],
            },
        }),
    ),
};
