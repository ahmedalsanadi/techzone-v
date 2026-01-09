//src/services/store-config.ts
import { cache } from 'react';
import { storeService } from './store-service';
import { StoreConfig, Category } from './types';

/**
 * Single source of truth for Store Configuration in Server Components.
 * React's `cache` handles per-request deduplication.
 * Next.js's Data Cache (inside storeService) handles cross-request persistence.
 */
export const getStoreConfig = cache(async (): Promise<StoreConfig | null> => {
    try {
        const config = await storeService.getConfig();
        return config;
    } catch (error) {
        console.error('[StoreConfig] Dedicated fetch failed:', error);
        return null;
    }
});

/**
 * Single source of truth for Category Tree in Server Components.
 */
export const getStoreCategories = cache(async (): Promise<Category[]> => {
    try {
        const categories = await storeService.getCategories(true);
        return categories || [];
    } catch (error) {
        console.error('[StoreCategories] Dedicated fetch failed:', error);
        return [];
    }
});
