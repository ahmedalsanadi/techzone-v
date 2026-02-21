//src/config/cache.ts
/**
 * Unified Cache Strategy Configuration
 * Centralizing all cache times for the application (in seconds).
 */
export const CACHE_STRATEGY = {
    // CMS Pages
    // CMS_PAGES_LIST: 86400, // 24 hours (86400 seconds)
    // CMS_PAGE_SINGLE: 604800, // 1 week (604800 seconds)

    // // Store Configuration
    // STORE_CONFIG: 86400, // 24 hours (86400 seconds)

    // // Categories & Collections
    // CATEGORIES_TREE: 3600, // 1 hour (3600 seconds)
    // COLLECTIONS: 3600, // 1 hour (3600 seconds)

    // // Products
    // PRODUCTS_LIST: 3600, // 1 hour (3600 seconds)
    // PRODUCT_SINGLE: 3600, // 1 hour (3600 seconds) - fixed from 500

    // // Static Data
    // COUNTRIES_CITIES: 86400, // 24 hours (86400 seconds)

    CMS_PAGES_LIST: 2000, // 24 hours (86400 seconds)
    CMS_PAGE_SINGLE: 604800, // 1 week (604800 seconds)

    // Store Configuration
    STORE_CONFIG: 600, // 24 hours (86400 seconds)

    // Categories & Collections
    CATEGORIES_TREE: 600, // 1 hour (3600 seconds)
    COLLECTIONS: 600, // 1 hour (3600 seconds)

    // Products
    PRODUCTS_LIST: 600, // 1 hour (3600 seconds)
    PRODUCT_SINGLE: 600, // 1 hour (3600 seconds) - fixed from 500

    // Static Data
    COUNTRIES_CITIES: 86400, // 24 hours (86400 seconds)
};

/**
 * Common tags for On-Demand Revalidation
 */
export const CACHE_TAGS = {
    // Core tags
    TENANT: (storeKey: string) => `tenant:${storeKey}`,

    // Feature tags
    CMS_PAGES: 'cms-pages',
    CMS_PAGE: (slug: string) => `cms-page-${slug}`,
    STORE_CONFIG: 'store-config',
    CATEGORIES: 'categories',
    COLLECTIONS: 'collections',
    PRODUCTS: 'products',
    PRODUCT: (slug: string) => `product-${slug}`,
    LOCATIONS: 'locations',
};
