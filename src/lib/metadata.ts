// src/lib/metadata.ts
import { Metadata } from 'next';
import { StoreConfig } from '@/services/types';
import { siteConfig } from '@/config/site';

/**
 * Generates metadata based on the store configuration and locale.
 */
export async function generateStoreMetadata(locale: string): Promise<Metadata> {
    const { getStoreConfig } = await import('@/services/store-config');
    const storeConfig = await getStoreConfig();

    if (!storeConfig) {
        return {
            title: siteConfig.name,
            description: siteConfig.description,
        };
    }

    const { store } = storeConfig;
    const title = store.name || siteConfig.name;
    const description = store.slogan || siteConfig.description;

    return {
        title: {
            default: title,
            template: `%s | ${title}`,
        },
        description,
        openGraph: {
            title,
            description,
            images: [store.logo_url || '/og-image.png'],
        },
    };
}

/**
 * Generates page-specific metadata, merging with store defaults.
 */
export async function generatePageMetadata({
    locale,
    title,
    description,
    path = '',
}: {
    locale: string;
    title: string;
    description?: string;
    path?: string;
}): Promise<Metadata> {
    const { getStoreConfig } = await import('@/services/store-config');
    const storeConfig = await getStoreConfig();

    const storeName = storeConfig?.store.name || siteConfig.name;
    const siteUrl = siteConfig.url;
    const fullUrl = `${siteUrl}/${locale}${path}`;

    return {
        title, // This works with the 'template' in layout.tsx
        description: description || storeConfig?.store.slogan,
        alternates: {
            canonical: fullUrl,
        },
        openGraph: {
            title: `${title} | ${storeName}`,
            description: description || storeConfig?.store.slogan,
            url: fullUrl,
            siteName: storeName,
            images: [storeConfig?.store.logo_url || '/og-image.png'],
        },
    };
}

/**
 * Generates structured data for JSON-LD.
 */
export function generateStructuredData(
    config: StoreConfig | null,
    locale: string,
    siteUrl: string,
) {
    if (!config) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: config.store.name,
        description: config.store.slogan,
        url: siteUrl,
        logo: config.store.logo_url,
        potentialAction: {
            '@type': 'OrderAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/${locale}/products`,
                inLanguage: locale,
                actionPlatform: [
                    'http://schema.org/DesktopWebPlatform',
                    'http://schema.org/MobileWebPlatform'
                ]
            }
        }
    };
}
