// src/lib/metadata.ts
import { Metadata } from 'next';
import { StoreConfig } from '@/services/types';
import { siteConfig } from '@/config/site';

/**
 * Generates metadata based on the store configuration and locale.
 * This is the central "One Place" for metadata.
 */
/**
 * Generates metadata based on the store configuration.
 * Decoupled from locale to ensure constant metadata.
 */
export async function generateStoreMetadata(): Promise<Metadata> {
    const { getStoreConfig } = await import('@/services/store-config');
    const storeConfig = await getStoreConfig();

    const siteUrl = siteConfig.url;
    const title = storeConfig?.store.name || siteConfig.name;
    const description = storeConfig?.store.slogan || siteConfig.description;
    const logo = storeConfig?.store.logo_url || '/og-image.png';

    return {
        metadataBase: new URL(siteUrl),
        title, // Single static string for the entire app
        description,
        alternates: {
            canonical: '/',
        },
        openGraph: {
            title,
            description,
            url: siteUrl,
            siteName: title,
            images: [logo],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [logo],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

/**
 * Generates page-specific metadata, merging with store defaults.
 */
export async function generatePageMetadata({
    title,
    description,
    path = '',
}: {
    title: string;
    description?: string;
    path?: string;
}): Promise<Metadata> {
    const { getStoreConfig } = await import('@/services/store-config');
    const storeConfig = await getStoreConfig();

    const storeName = storeConfig?.store.name || siteConfig.name;
    const siteUrl = siteConfig.url;
    const fullUrl = `${siteUrl}${path}`;

    return {
        title, 
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
        twitter: {
            card: 'summary_large_image',
            title: `${title} | ${storeName}`,
            description: description || storeConfig?.store.slogan,
            images: [storeConfig?.store.logo_url || '/og-image.png'],
        },
    };
}

/**
 * Generates structured data for JSON-LD.
 */
export function generateStructuredData(
    config: StoreConfig | null,
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
                urlTemplate: `${siteUrl}/products`,
                inLanguage: 'en', // Default or remove
                actionPlatform: [
                    'http://schema.org/DesktopWebPlatform',
                    'http://schema.org/MobileWebPlatform'
                ]
            }
        }
    };
}

/**
 * Generates product-specific metadata.
 */
export async function generateProductMetadata(id: string): Promise<Metadata> {
    const { storeService } = await import('@/services/store-service');
    
    try {
        const product = await storeService.getProduct(id);
        if (!product) return {};

        return {
            alternates: {
                canonical: `./${id}`,
            },
            openGraph: {
                title: product.title,
                description: product.description,
                images: [{ url: product.cover_image_url }],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: product.title,
                description: product.description,
                images: [product.cover_image_url],
            },
        };
    } catch (e) {
        return {};
    }
}

/**
 * Generates Product Specific Structured Data (Schema.org)
 */
export function generateProductStructuredData(
    product: any,
    siteUrl: string,
) {
    if (!product) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name || product.title,
        description: product.description,
        image: product.cover_image_url,
        sku: product.id,
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/products/${product.id}`,
            priceCurrency: 'SAR', // Can be dynamic
            price: product.price,
            availability: product.is_available 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        },
    };
}

/**
 * Generates ItemList Structured Data for collection pages (Search Console / Search Results)
 */
export function generateCollectionStructuredData(
    products: any[],
    siteUrl: string,
) {
    if (!products || products.length === 0) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.slice(0, 20).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/products/${product.id}`,
            name: product.name || product.title,
            image: product.cover_image_url,
        })),
    };
}

