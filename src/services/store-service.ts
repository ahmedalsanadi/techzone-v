import { fetchLibero, fetchLiberoFull } from './api';
import {
    StoreConfig,
    Product,
    PaginationMeta,
    Category,
    Branch,
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
            next: {
                revalidate: 3600,
                tags: ['store-config'],
            },
        }),

    /**
     * Get all categories with optional tree structure.
     */
    getCategories: (tree: boolean = true) =>
        fetchLibero<Category[]>('/store/categories', {
            params: { tree },
            next: {
                revalidate: 3600,
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
     * Validates branch structure and filters out invalid entries.
     */
    getBranches: async (
        params: { type?: number; search?: string } = {},
    ): Promise<Branch[]> => {
        const data = await fetchLibero<Branch[]>('/store/branches', {
            params,
            // isProtected: true,
            next: { revalidate: 3600 },
        });

        // Validate and filter branches
        if (!Array.isArray(data)) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('getBranches: Expected array, got:', typeof data);
            }
            return [];
        }

        return data.filter((branch) => {
            // Validate required fields
            const isValid =
                branch &&
                typeof branch === 'object' &&
                typeof branch.id === 'number' &&
                typeof branch.name === 'string' &&
                branch.address &&
                typeof branch.address === 'object' &&
                branch.working_hours &&
                typeof branch.working_hours === 'object';

            if (!isValid && process.env.NODE_ENV === 'development') {
                console.warn('getBranches: Invalid branch structure:', branch);
            }

            return isValid;
        });
    },

    /**
     * Get a single branch by ID.
     * Throws ApiError with status 404 if branch not found.
     */
    getBranch: async (id: string | number): Promise<Branch> => {
        try {
            const branch = await fetchLibero<Branch>(`/store/branches/${id}`, {
                // isProtected: true,
                next: { revalidate: 3600 },
            });

            // Validate branch structure
            if (
                !branch ||
                typeof branch !== 'object' ||
                typeof branch.id !== 'number' ||
                typeof branch.name !== 'string' ||
                !branch.address ||
                !branch.working_hours
            ) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('getBranch: Invalid branch structure:', branch);
                }
                throw new Error('Invalid branch data structure');
            }

            return branch;
        } catch (error) {
            // Re-throw ApiError as-is (includes 404 status)
            if (error instanceof Error && 'status' in error) {
                throw error;
            }
            // Wrap other errors
            throw error;
        }
    },

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
    getCollections: () =>
        fetchLibero<Collection[]>('/store/collections', {
            next: {
                revalidate: 3600, // Cache for 1 hour
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
