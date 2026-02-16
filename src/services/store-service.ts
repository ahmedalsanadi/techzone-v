import { fetchLibero, fetchLiberoFull } from '@/lib/api';
import { PaginationMeta } from '@/types/api';
import {
    StoreConfig,
    Product,
    Category,
    Collection,
    ProductsFiltersVars,
} from '@/types/store';
import { CACHE_STRATEGY, CACHE_TAGS } from '@/config/cache';
import type { CustomerProfile, ProfileUpdateRequest } from '@/types/auth';
import type {
    Address,
    CreateAddressRequest,
    UpdateAddressRequest,
    Country,
    City,
    District,
} from '@/types/address';

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
                revalidate: CACHE_STRATEGY.STORE_CONFIG,
                tags: [CACHE_TAGS.STORE_CONFIG],
            },
        }),

    /**
     * Get all categories with optional tree structure.
     */
    getCategories: (tree: boolean = true) =>
        fetchLibero<Category[]>('/store/categories', {
            params: { tree },
            next: {
                revalidate: CACHE_STRATEGY.CATEGORIES_TREE,
                tags: [CACHE_TAGS.CATEGORIES],
            },
        }),

    /**
     * List products with filtering and pagination.
     */
    async getProducts(
        params: Record<string, string | number | boolean | undefined> = {},
        options?: { signal?: AbortSignal },
    ): Promise<{ data: Product[]; meta: PaginationMeta }> {
        const response = await fetchLiberoFull<Product[]>('/store/products', {
            params,
            next: {
                revalidate: CACHE_STRATEGY.PRODUCTS_LIST,
                tags: [CACHE_TAGS.PRODUCTS],
            },
            cache: typeof window !== 'undefined' ? 'no-store' : undefined,
            signal: options?.signal,
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
     * Get products filter variables for building dynamic filter UI.
     */
    getProductsFilters: (
        params?: { search?: string; category_id?: string | number },
        options?: { signal?: AbortSignal },
    ) =>
        fetchLibero<ProductsFiltersVars>('/store/products/filters', {
            params,
            cache: typeof window !== 'undefined' ? 'no-store' : undefined,
            signal: options?.signal,
        }),

    /**
     * Get a single product by Slug.
     */
    getProduct: (slug: string) =>
        fetchLibero<Product>(`/store/products/${slug}`, {
            next: {
                revalidate: CACHE_STRATEGY.PRODUCT_SINGLE,
                tags: [CACHE_TAGS.PRODUCT(slug)],
            },
        }),

    /**
     * Get category by Slug.
     */
    getCategory: (slug: string) =>
        fetchLibero<Category>(`/store/categories/${slug}`, {
            next: { revalidate: CACHE_STRATEGY.CATEGORIES_TREE },
        }),

    /**
     * Get all collections/offers.
     */
    getCollections: () =>
        fetchLibero<Collection[]>('/store/collections', {
            next: {
                revalidate: CACHE_STRATEGY.COLLECTIONS,
                tags: [CACHE_TAGS.COLLECTIONS],
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

    /**
     * Get customer addresses.
     */
    getAddresses: (params?: { default?: boolean; label?: string }) =>
        fetchLibero<Address[]>('/store/addresses', {
            params,
            isProtected: true,
        }),

    /**
     * Get a specific address.
     */
    getAddress: (id: number) =>
        fetchLibero<Address>(`/store/addresses/${id}`, {
            isProtected: true,
        }),

    /**
     * Create a new address.
     */
    createAddress: (data: CreateAddressRequest) =>
        fetchLibero<Address>('/store/addresses', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
        }),

    /**
     * Update an existing address.
     */
    updateAddress: (id: number, data: UpdateAddressRequest) =>
        fetchLibero<Address>(`/store/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            isProtected: true,
        }),

    /**
     * Delete an address.
     */
    deleteAddress: (id: number) =>
        fetchLiberoFull<null>(`/store/addresses/${id}`, {
            method: 'DELETE',
            isProtected: true,
        }),

    /**
     * Get list of countries.
     */
    getCountries: () =>
        fetchLibero<Country[]>('/store/locations/countries', {
            next: {
                revalidate: CACHE_STRATEGY.COUNTRIES_CITIES,
                tags: [CACHE_TAGS.LOCATIONS],
            },
        }),

    /**
     * Get cities by country.
     */
    getCities: (countryId: number) =>
        fetchLibero<City[]>('/store/locations/cities', {
            params: { country_id: countryId },
            next: { revalidate: CACHE_STRATEGY.COUNTRIES_CITIES },
        }),

    /**
     * Get districts by city.
     */
    getDistricts: (cityId: number) =>
        fetchLibero<District[]>('/store/locations/districts', {
            params: { city_id: cityId },
            next: { revalidate: CACHE_STRATEGY.COUNTRIES_CITIES },
        }),
};
