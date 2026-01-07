import { env } from './env';

/**
 * ⚠️ PLATFORM DEFAULTS
 * - Used for dev
 * - Used as SEO fallback
 * - MUST remain static
 */
export const siteConfig = {
  name: 'Fasto',
  description: 'A premium restaurant management and ordering platform.',
  url: env.siteUrl,
  ogImage: `${env.siteUrl}/og-image.png`,
};

export type SiteConfig = typeof siteConfig;
