//src/config/cache.ts
/**
 * Unified Cache Strategy Configuration
 * Centralizing all cache times for the application.
 */
export const CACHE_STRATEGY = {
    // CMS Pages
    CMS_PAGES_LIST: 86400, // 24 hours
    CMS_PAGE_SINGLE: 604800, // 1 week

    // Store Configuration
    STORE_CONFIG: 0, // 1 hour

    // Categories & Collections
    CATEGORIES_TREE: 3600, // 1 hour
    COLLECTIONS: 3600, // 1 hour

    // Products
    PRODUCTS_LIST: 300, // 5 minutes
    PRODUCT_SINGLE: 300, // 5 minutes

    // Static Data
    COUNTRIES_CITIES: 86400, // 24 hours
};

/**
 * Common tags for On-Demand Revalidation
 */
export const CACHE_TAGS = {
    CMS_PAGES: 'cms-pages',
    cmsPage: (slug: string) => `cms-page-${slug}`,
    STORE_CONFIG: 'store-config',
    CATEGORIES: 'categories',
    COLLECTIONS: 'collections',
};
