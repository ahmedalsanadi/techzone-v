//src/services/store-config.ts
import { cache } from 'react';
import { storeService } from './store-service';
import { cmsService } from './cms-service';
import { StoreConfig, Category, CMSPage } from './types';
import { resolveTenant } from '@/lib/tenant';
import { headers } from 'next/headers';

/**
 * Single source of truth for Store Configuration in Server Components.
 */
export const getStoreConfig = cache(async (): Promise<StoreConfig | null> => {
    try {
        // Optimization: Fast-fail if no tenant can be resolved (avoids noise during build)
        const h = await headers();
        const { storeKey } = resolveTenant(h.get('host'));
        if (!storeKey) return null;

        const config = await storeService.getConfig();
        return config;
    } catch (error) {
        // Silence errors during build/static generation
        if (process.env.NODE_ENV === 'production') return null;
        console.error('[StoreConfig] Dedicated fetch failed:', error);
        return null;
    }
});

/**
 * Single source of truth for Category Tree in Server Components.
 */
export const getStoreCategories = cache(async (): Promise<Category[]> => {
    try {
        const h = await headers();
        const { storeKey } = resolveTenant(h.get('host'));
        if (!storeKey) return [];

        const categories = await storeService.getCategories(true);
        return categories || [];
    } catch (error) {
        if (process.env.NODE_ENV === 'production') return [];
        console.error('[StoreCategories] Dedicated fetch failed:', error);
        return [];
    }
});

/**
 * Single source of truth for CMS Pages in Server Components.
 */
export const getStorePages = cache(async (): Promise<CMSPage[]> => {
    try {
        const h = await headers();
        const { storeKey } = resolveTenant(h.get('host'));
        if (!storeKey) return [];

        const pages = await cmsService.getPages();
        return pages || [];
    } catch (error) {
        if (process.env.NODE_ENV === 'production') return [];
        console.error('[StorePages] Dedicated fetch failed:', error);
        return [];
    }
});
