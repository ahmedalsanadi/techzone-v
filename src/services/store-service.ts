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
    async getProducts(params?: {
        search?: string;
        category_id?: number | string;
        is_featured?: boolean | string;
        is_latest?: boolean | string;
        page?: number;
        per_page?: number;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<{ data: Product[]; meta: PaginationMeta }> {
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
                total: response.data.length,
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
};
