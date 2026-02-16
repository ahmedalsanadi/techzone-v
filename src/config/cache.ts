//src/config/cache.ts
/**
 * Unified Cache Strategy Configuration
 * Centralizing all cache times for the application (in seconds).
 */
export const CACHE_STRATEGY = {
    // CMS Pages
    CMS_PAGES_LIST: 86400, // 24 hours
    CMS_PAGE_SINGLE: 604800, // 1 week

    // Store Configuration
    STORE_CONFIG: 86400, // 24 hours

    // Categories & Collections
    CATEGORIES_TREE: 3600, // 1 hour
    COLLECTIONS: 3600, // 1 hour

    // Products
    PRODUCTS_LIST: 3600, // 1 hour
    PRODUCT_SINGLE: 3600, // 1 hour

    // Static Data
    COUNTRIES_CITIES: 86400, // 24 hours
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
