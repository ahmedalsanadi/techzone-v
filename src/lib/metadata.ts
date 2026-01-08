// src/lib/metadata.ts
import { siteConfig } from '@/config/site';

/**
 * Generates Product Structured Data with correct Schema.org enumerations
 */
export function generateProductStructuredData(product: any, siteUrl: string) {
    if (!product) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name || product.title,
        description: product.description,
        image: product.cover_image_url,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: siteConfig.name,
        },
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/products/${product.slug || product.id}`,
            priceCurrency: 'SAR',
            price: product.price,
            // Use correct Schema.org enumeration URLs
            availability: product.is_available
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            // Add platform information
            availableAtOrFrom: {
                '@type': 'Place',
                name: siteConfig.name,
                url: siteUrl,
            },
            validFrom: new Date().toISOString(),
        },
        // Add aggregateRating if you have reviews
        ...(product.rating &&
            product.review_count && {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating,
                    reviewCount: product.review_count,
                    bestRating: '5',
                    worstRating: '1',
                },
            }),
    };
}

/**
 * Generates Collection/ItemList Structured Data
 */
export function generateCollectionStructuredData(
    products: any[],
    siteUrl: string,
    categoryName?: string,
) {
    if (!products || products.length === 0) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: categoryName || 'Products',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/products/${product.slug || product.id}`,
            item: {
                '@type': 'Product',
                name: product.name || product.title,
                image: product.cover_image_url,
                description: product.description,
                offers: {
                    '@type': 'Offer',
                    price: product.price,
                    priceCurrency: 'SAR',
                    availability: product.is_available
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                },
            },
        })),
    };
}

/**
 * Generates Organization Structured Data for the main site
 */
export function generateOrganizationStructuredData(
    storeConfig: any,
    siteUrl: string,
) {
    if (!storeConfig) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: storeConfig.store.name,
        description: storeConfig.store.slogan,
        url: siteUrl,
        logo: storeConfig.store.logo_url,
        image: storeConfig.store.logo_url,
        telephone: storeConfig.store.phone,
        email: storeConfig.store.email,
        address: storeConfig.store.address && {
            '@type': 'PostalAddress',
            streetAddress: storeConfig.store.address.street,
            addressLocality: storeConfig.store.address.city,
            addressCountry: storeConfig.store.address.country,
        },
        sameAs: [
            storeConfig.store.social?.facebook,
            storeConfig.store.social?.instagram,
            storeConfig.store.social?.twitter,
        ].filter(Boolean),
        hasMenu: `${siteUrl}/products`,
        servesCuisine: storeConfig.store.cuisine_type,
        potentialAction: {
            '@type': 'OrderAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/products`,
                inLanguage: ['en', 'ar'],
                actionPlatform: [
                    'https://schema.org/DesktopWebPlatform',
                    'https://schema.org/MobileWebPlatform',
                ],
            },
            deliveryMethod: [
                'https://schema.org/OnSitePickup',
                'https://schema.org/DeliveryMethod',
            ],
        },
    };
}
