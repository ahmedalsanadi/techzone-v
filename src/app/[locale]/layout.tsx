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
import { siteConfig } from '@/config/site';

import '@/app/globals.css';
import PageContainer from '@/components/layouts/PageContainer';
import { ServiceUnavailableFallback } from '@/components/layouts/service-unavailable-fallback';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { getStoreCategories } from '@/services/store-config';
import { getServerStoreConfig } from '@/lib/server/store-config';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { ThemeStyles } from '@/components/providers/ThemeStyles';
import ToasterContainer from '@/components/layouts/ToasterContainer';
import BranchSelectionModal from '@/components/modals/BranchSelectionModal';
import BranchModalInitializer from '@/components/modals/BranchModalInitializer';

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
/*                               STATIC METADATA                               */
/* -------------------------------------------------------------------------- */
/**
 * ⚠️ IMPORTANT:
 * - MUST be static
 * - MUST NOT call APIs
 * - MUST NOT depend on tenant data
 * This prevents title flicker and slow navigation.
 */
export const metadata: Metadata = {
    title: {
        default: siteConfig.name, // "Fasto"
        template: `%s | ${siteConfig.name}`, // "Products | Fasto"
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
        siteName: siteConfig.name,
        type: 'website',
        images: [{ url: '/og-image.png' }],
    },
    twitter: {
        card: 'summary_large_image',
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        languages: {
            en: '/en',
            ar: '/ar',
        },
    },
};

//this maybe used laterly dont remove it at all
// export async function generateMetadata(): Promise<Metadata> {
//   const site = await resolveSiteIdentity();

//   return {
//     title: {
//       default: site.name,
//       template: `%s | ${site.name}`,
//     },
//     description: site.description,
//     metadataBase: new URL(site.url),
//     openGraph: {
//       siteName: site.name,
//       images: [site.ogImage],
//       type: 'website',
//     },
//     robots: {
//       index: true,
//       follow: true,
//     },
//   };
// }

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
    // Enable static rendering and validate locale
    setupLocale(locale);

    const isArabic = locale === 'ar';
    const messages = await getMessages({ locale });

    // Tenant config (UI + branding only, NOT metadata)
    // Using shared server context ensures single fetch per request
    const [storeConfig, categories] = await Promise.all([
        getServerStoreConfig(),
        getStoreCategories(),
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
                            href={storeConfig.store.logo_url || '/favicon.ico'}
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
                {!storeConfig ? (
                    <ServiceUnavailableFallback />
                ) : (
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem>
                        <NextIntlClientProvider
                            locale={locale}
                            messages={messages}>
                            <StoreProvider
                                config={storeConfig}
                                categories={categories}>
                                <QueryProvider>
                                    <PageContainer>{children}</PageContainer>
                                    <ToasterContainer isArabic={isArabic} />
                                    <BranchSelectionModal />
                                    <BranchModalInitializer />
                                </QueryProvider>
                            </StoreProvider>
                        </NextIntlClientProvider>
                    </ThemeProvider>
                )}

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
