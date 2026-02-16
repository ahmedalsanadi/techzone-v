// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { setupLocale } from '@/i18n/setup-locale';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { resolveSiteIdentity } from '@/lib/tenant/resolve-site';

import '@/app/globals.css';
import PageContainer from '@/components/layouts/PageContainer';
import { ServiceUnavailableFallback } from '@/components/layouts/service-unavailable-fallback';
import { QueryProvider } from '@/components/providers/QueryProvider';
import {
    getServerStoreConfig,
    getStoreCategories,
    getStorePages,
} from '@/services/store-config';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { ThemeStyles } from '@/components/providers/ThemeStyles';
import ToasterContainer from '@/components/layouts/ToasterContainer';
import BranchSelectionModal from '@/components/modals/BranchSelectionModal';
import BranchModalInitializer from '@/components/modals/BranchModalInitializer';
import { ProductConfigProvider } from '@/components/providers/ProductConfigProvider';

/* -------------------------------------------------------------------------- */
/*                                   FONTS                                    */
/* -------------------------------------------------------------------------- */

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
    variable: '--font-ibm-plex-sans-arabic',
    subsets: ['arabic'],
    weight: ['400', '500', '700'],
});

/* -------------------------------------------------------------------------- */
/*                               DYNAMIC METADATA                              */
/* -------------------------------------------------------------------------- */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const site = await resolveSiteIdentity();

    return {
        title: {
            default: site.name,
            template: `%s | ${site.name}`,
        },
        description: site.description,
        metadataBase: new URL(site.url),
        openGraph: {
            siteName: site.name,
            type: 'website',
            images: [{ url: site.ogImage }],
        },
        twitter: {
            card: 'summary_large_image',
        },
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `${site.url}/${locale}`,
            languages: {
                en: `${site.url}/en`,
                ar: `${site.url}/ar`,
            },
        },
    };
}

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setupLocale(locale);

    const isArabic = locale === 'ar';
    // Execute all critical server-side fetches in parallel for maximum performance.
    // getServerStoreConfig and others are wrapped in React cache() to ensure
    // deduplication if called again in satisfy metadata generation or other components.
    const [messages, storeConfig, categories, cmsPages] = await Promise.all([
        getMessages({ locale }),
        getServerStoreConfig(),
        getStoreCategories(),
        getStorePages(),
    ]);

    return (
        <html
            lang={locale}
            dir={isArabic ? 'rtl' : 'ltr'}
            suppressHydrationWarning>
            <head>
                {/* Critical: Theme styles must be first to prevent FOUC */}
                <ThemeStyles config={storeConfig} />
                {storeConfig && (
                    <>
                        <link
                            rel="icon"
                            href={
                                storeConfig.theme.icon_url ||
                                storeConfig.theme.logo_url ||
                                storeConfig.store.logo_url ||
                                '/favicon.ico'
                            }
                        />
                        <meta
                            name="theme-color"
                            content={
                                storeConfig.theme.primary_color || '#FF5200'
                            }
                        />
                    </>
                )}
            </head>

            <body
                className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSansArabic.variable} antialiased font-sans`}
                suppressHydrationWarning>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem>
                        {!storeConfig ? (
                            <ServiceUnavailableFallback />
                        ) : (
                            <QueryProvider>
                                <StoreProvider
                                    config={storeConfig}
                                    categories={categories}
                                    cmsPages={cmsPages}>
                                    <ProductConfigProvider>
                                        <PageContainer>
                                            {children}
                                        </PageContainer>
                                    </ProductConfigProvider>
                                    <ToasterContainer isArabic={isArabic} />
                                    <BranchSelectionModal />
                                    <BranchModalInitializer />
                                </StoreProvider>
                            </QueryProvider>
                        )}
                    </ThemeProvider>
                </NextIntlClientProvider>

                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}

/* -------------------------------------------------------------------------- */
/*                              STATIC PARAMS                                 */
/* -------------------------------------------------------------------------- */

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}
