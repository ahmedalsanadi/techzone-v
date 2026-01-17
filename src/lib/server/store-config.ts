/**
 * Server-side context for sharing request-scoped data
 * between layout and page components without prop drilling.
 *
 * Uses React's cache() to ensure single fetch per request.
 *
 * ⚠️ SERVER ONLY - Never import this in client components
 */
import { cache } from 'react';
import { getStoreConfig } from '@/services/store-config';
import { StoreConfig } from '@/services/types';

/**
 * Get store config (cached per request).
 * This is safe to call multiple times - React cache() ensures deduplication.
 *
 * Layout calls this once, pages can call it safely without extra fetches.
 */
export const getServerStoreConfig = cache(
    async (): Promise<StoreConfig | null> => {
        return getStoreConfig();
    },
);
