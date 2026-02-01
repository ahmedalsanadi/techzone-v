//src/config/env.ts
/**
 * Centralized environment variable management.
 * This ensures we have a single place to handle defaults and validation.
 */

export const env = {
    // API Keys & Tokens
    liberoApiKey:
        process.env.NEXT_PUBLIC_LIBERO_API_KEY ||
        process.env.LIBERO_API_KEY ||
        '',

    // URLs
    apiUrl:
        process.env.NEXT_PUBLIC_API_URL ||
        'https://store-api.libro-shop.com/api/v1',

    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://fasto.vercel.app',

    // Tenant resolution
    storeDefaultKey: process.env.STORE_DEFAULT_KEY || '',
    storeDomainMap: process.env.STORE_DOMAIN_MAP || '',
    allowDefaultStoreKeyInProd:
        process.env.ALLOW_DEFAULT_STORE_KEY_IN_PROD === 'true',
    allowDefaultStoreKeyOnPlatformHosts:
        process.env.ALLOW_DEFAULT_STORE_KEY_ON_PLATFORM_HOSTS === 'true',

    // Environment
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
};
