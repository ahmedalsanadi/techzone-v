//src/services/store-service.ts
import { cache } from 'react';
import { fetchLibero, fetchLiberoFull } from './api';
import { StoreConfig, Product, PaginationMeta, Category } from './types';

/**
 * Service for store-related data fetching.
 */
export const storeService = {
    /**
     * Get store configuration including theme and home sections.
     */
    getConfig: cache(() =>
        fetchLibero<StoreConfig>('/store/config', {
            next: { revalidate: 3600 },
        }),
    ),

    /**
     * Get all categories with optional tree structure.
     */
    getCategories: cache((tree: boolean = true) =>
        fetchLibero<Category[]>('/store/categories', {
            params: { tree },
            next: { revalidate: 3600 },
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

        return {
            data: response.data,
            meta: response.meta || {
                current_page: 1,
                last_page: 1,
                per_page: params?.per_page || 10,
                total: response.data?.length || 0,
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
};
