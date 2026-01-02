export const siteConfig = {
    name: 'Next.js i18n Template',
    description: 'A modern Next.js template with i18n support.',
    url:
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://next-app-i18n-starter.vercel.app',
    links: {
        twitter: 'https://twitter.com/s0ver5',
        github: 'https://github.com/s0ver5',
    },
};

export type SiteConfig = typeof siteConfig;
