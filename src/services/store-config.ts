//src/services/store-config.ts
import { cache } from 'react';
import { storeService } from './store-service';
import { cmsService } from './cms-service';
import { StoreConfig, Category, CMSPage } from '@/types/store';
import { resolveTenant } from '@/lib/tenant';
import { headers } from 'next/headers';
import { ApiError } from '@/lib/api';

function isNetworkOrTimeoutError(error: unknown): boolean {
    if (error instanceof ApiError) {
        if (error.status === 504 || /network unavailable|connection timed out/i.test(error.message))
            return true;
    }
    if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message?.includes('fetch failed')) return true;
        const cause = (error as Error & { cause?: unknown }).cause;
        if (cause instanceof Error && /timeout|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(String(cause.message))) return true;
    }
    return false;
}

function logStoreConfigFailure(label: string, error: unknown): void {
    if (process.env.NODE_ENV === 'production') return;
    if (isNetworkOrTimeoutError(error)) {
        console.warn(`[${label}] Store API unreachable (network/timeout). Showing fallback.`);
    } else {
        console.error(`[${label}] Fetch failed:`, error);
    }
}

/**
 * Single source of truth for Store Configuration in Server Components.
 */
function getRequestHostFromHeaders(h: Headers): string | null {
    const forwarded = h.get('x-forwarded-host');
    return (forwarded ? forwarded.split(',')[0].trim() : null) || h.get('host');
}

export const getStoreConfig = cache(async (): Promise<StoreConfig | null> => {
    try {
        const h = await headers();
        const host = getRequestHostFromHeaders(h);
        const { storeKey } = resolveTenant(host);
        if (!storeKey) return null;

        const config = await storeService.getConfig();
        return config;
    } catch (error) {
        logStoreConfigFailure('StoreConfig', error);
        return null;
    }
});

/**
 * Single source of truth for Category Tree in Server Components.
 */
export const getStoreCategories = cache(async (): Promise<Category[]> => {
    try {
        const h = await headers();
        const host = getRequestHostFromHeaders(h);
        const { storeKey } = resolveTenant(host);
        if (!storeKey) return [];

        const categories = await storeService.getCategories(true);
        return categories || [];
    } catch (error) {
        logStoreConfigFailure('StoreCategories', error);
        return [];
    }
});

/**
 * Single source of truth for CMS Pages in Server Components.
 */
export const getStorePages = cache(async (): Promise<CMSPage[]> => {
    try {
        const h = await headers();
        const host = getRequestHostFromHeaders(h);
        const { storeKey } = resolveTenant(host);
        if (!storeKey) return [];

        const pages = await cmsService.getPages();
        return pages || [];
    } catch (error) {
        logStoreConfigFailure('StorePages', error);
        return [];
    }
});

/**
 * Get store config (cached per request). Server-only.
 * Safe to call multiple times - React cache() ensures deduplication.
 */
export const getServerStoreConfig = cache(async () => getStoreConfig());
