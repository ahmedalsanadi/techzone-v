//src/config/cache.ts
/**
 * Unified Cache Strategy Configuration
 * Centralizing all cache times for the application.
 */
export const CACHE_STRATEGY = {
    // CMS Pages
    CMS_PAGES_LIST: 0, // 24 hours
    CMS_PAGE_SINGLE: 0, // 1 week

    // Store Configuration
    STORE_CONFIG: 0, // 24 hours

    // Categories & Collections
    CATEGORIES_TREE: 0, // 1 hour
    COLLECTIONS: 0, // 1 hour

    // Products
    PRODUCTS_LIST:0, // 1 hour
    PRODUCT_SINGLE: 0, // 1 hour

    // Static Data
    COUNTRIES_CITIES: 0, // 24 hours
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
