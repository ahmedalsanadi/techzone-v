import { env } from './env';

/**
 * Site configuration
 * This provides default values used for SEO and fallback data across the application.
 * In this multi-tenant setup, these values act as the platform-level defaults.
 */
export const siteConfig = {
    name: 'Fasto',
    description: 'A premium restaurant management and ordering platform.',
    url: env.siteUrl,
    ogImage: `${env.siteUrl}/og-image.png`,
    links: {
        twitter: 'https://twitter.com/libero',
        github: 'https://github.com/libero-ecommerce',
    },
    mainNav: [
        {
            title: 'Home',
            href: '/',
        },
    ],
};

export type SiteConfig = typeof siteConfig;
