//src/services/store-config.ts
import { storeService } from './store-service';
import { StoreConfig } from './types';

// Simple in-memory cache for server-side requests
let cachedStoreConfig: StoreConfig | null = null;
let lastFetchTime = 0;
let lastFailureTime = 0;
let inflightPromise: Promise<StoreConfig | null> | null = null;

const CACHE_TTL = 3600 * 1000; // 1 hour for success
const FAILURE_TTL = 30 * 1000; // 30 seconds for failure (negative cache)

/**
 * Optimized fetch for store configuration with basic caching, de-duplication, and error handling.
 */
export async function getStoreConfig(): Promise<StoreConfig | null> {
    const now = Date.now();

    // 1. Return long-term successful cache
    if (cachedStoreConfig && now - lastFetchTime < CACHE_TTL) {
        return cachedStoreConfig;
    }

    // 2. Prevent frequent retries if the API is currently down (negative cache)
    if (lastFailureTime > 0 && now - lastFailureTime < FAILURE_TTL) {
        // Only warn once every 30s to avoid log spam
        return null;
    }

    // 3. De-duplicate multiple simultaneous requests
    if (inflightPromise) {
        return inflightPromise;
    }

    inflightPromise = (async () => {
        try {
            const config = await storeService.getConfig();
            cachedStoreConfig = config;
            lastFetchTime = Date.now();
            lastFailureTime = 0; // Reset failure on success
            return config;
        } catch (error) {
            console.error('[StoreConfig] Failed to fetch:', error);
            lastFailureTime = Date.now(); // Set failure timestamp
            return null;
        } finally {
            inflightPromise = null; // Clear inflight promise
        }
    })();

    return inflightPromise;
}
