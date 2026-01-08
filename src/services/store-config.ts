//src/services/store-config.ts
import { cache } from 'react';
import { storeService } from './store-service';
import { StoreConfig } from './types';

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
