import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages, getTranslations } from 'next-intl/server';
import { setupLocale } from '@/i18n/setup-locale';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '../../config/site';
import '../globals.css';
import { Toaster } from 'sonner';
import { ShoppingCart } from 'lucide-react';

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

// Extract domain to a constant to avoid repetition
const DOMAIN = siteConfig.url;

import PageContainer from '@/components/layouts/PageContainer';

import { QueryProvider } from '@/components/providers/query-provider';

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
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return (
        <html
            lang={locale}
            dir={isArabic ? 'rtl' : 'ltr'}
            suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#000000" />
                <meta name="theme-color" content="#000000" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: t('title'),
                            description: t('description'),
                            url: DOMAIN,
                            inLanguage: locale,
                        }),
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSansArabic.variable} antialiased`}
                suppressHydrationWarning>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <QueryProvider>
                            <PageContainer>{children}</PageContainer>
                            <Toaster
                                position={
                                    isArabic ? 'top-right' : 'top-left'
                                }
                                expand={false}
                                richColors
                                closeButton
                                dir={isArabic ? 'rtl' : 'ltr'}
                                toastOptions={{
                                    className:
                                        'font-ibm-plex-sans-arabic border-0 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 gap-4 bg-white/95 backdrop-blur-md',
                                    style: {
                                        background: 'rgba(255, 255, 255, 0.95)',
                                    },
                                    actionButtonStyle: {
                                        backgroundColor: '#B44734',
                                        color: '#fff',

                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        padding: '10px 16px',
                                        fontSize: '12px',
                                        transition: 'all 0.2s',
                                    },
                                }}
                            />
                        </QueryProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>

                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    const alternates: Record<string, string> = {};
    routing.locales.forEach((l) => {
        alternates[l] = `${DOMAIN}/${l}`;
    });

    return {
        title: t('title'),
        description: t('description'),
        keywords: t('keywords'),
        other: {
            'google-site-verification': '',
        },
        openGraph: {
            title: t('title'),
            description: t('description'),
            url: DOMAIN,
            siteName: '',
            images: [
                {
                    url: `${DOMAIN}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: t('title'),
                },
            ],
            locale: locale,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
            images: [`${DOMAIN}/og-image.png`],
            creator: '@s0ver5',
        },
        alternates: {
            canonical: DOMAIN,
            languages: alternates,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}
