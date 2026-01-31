//src/services/store-config.ts
import { cache } from 'react';
import { storeService } from './store-service';
import { cmsService } from './cms-service';
import { StoreConfig, Category, CMSPage } from './types';

/**
 * Single source of truth for Store Configuration in Server Components.
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

/**
 * Single source of truth for CMS Pages in Server Components.
 */
export const getStorePages = cache(async (): Promise<CMSPage[]> => {
    try {
        const pages = await cmsService.getPages();
        return pages || [];
    } catch (error) {
        console.error('[StorePages] Dedicated fetch failed:', error);
        return [];
    }
});
