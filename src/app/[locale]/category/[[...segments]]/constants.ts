// src/app/[locale]/category/[[...segments]]/constants.ts

/**
 * Query configuration constants
 */
export const QUERY_CONFIG = {
    STALE_TIME: 1000 * 60 * 5, // 5 minutes
    GC_TIME: 1000 * 60 * 10, // 10 minutes
    RETRY: 1,
    RETRY_DELAY: 1000,
} as const;

/**
 * Animation and transition constants
 */
export const TRANSITIONS = {
    OPACITY_DURATION: 300,
    FADE_IN_DURATION: 300,
    CATEGORY_SLIDE_DURATION: 400,
    PRODUCT_FADE_DURATION: 300,
} as const;

/**
 * Minimum heights to prevent layout shift
 */
export const MIN_HEIGHTS = {
    PRODUCTS_GRID: 600, // Minimum height for products grid in pixels
    EMPTY_STATE: 200, // Minimum height for empty state
} as const;
