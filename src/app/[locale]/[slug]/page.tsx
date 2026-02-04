// src/app/[locale]/[slug]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cmsService } from '@/services/cms-service';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { sanitizeHTML } from '@/lib/sanitize';
import { resolveSiteIdentity } from '@/lib/tenant/resolve-site';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

/**
 * Enhanced SEO Metadata Implementation
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    try {
        const page = await cmsService.getPage(slug);
        const site = await resolveSiteIdentity();
        const url = `${site.url}/${locale}/${slug}`;

        return {
            title: page.title,
            description: page.description || page.title,
            alternates: {
                canonical: url,
                languages: {
                    en: `${site.url}/en/${slug}`,
                    ar: `${site.url}/ar/${slug}`,
                },
            },
            openGraph: {
                title: page.title,
                description: page.description || page.title,
                url: url,
                siteName: site.name,
                locale: locale === 'ar' ? 'ar_SA' : 'en_US',
                type: 'article',
                images: [
                    {
                        url: site.ogImage,
                        width: 1200,
                        height: 630,
                        alt: page.title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: page.title,
                description: page.description || page.title,
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                },
            },
        };
    } catch {
        return {
            title: 'Page Not Found',
            robots: 'noindex, nofollow',
        };
    }
}

export default async function CMSPageDetail({ params }: Props) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale });
    const site = await resolveSiteIdentity();

    // Safety check: Prevent fallback for existing static routes if any logic fails
    // (Next.js handles this by file priority, but for clarity)

    let page;
    try {
        page = await cmsService.getPage(slug);
    } catch (error) {
        console.error('[CMSPage] Fetch failed:', error);
        notFound();
    }

    if (!page) {
        notFound();
    }

    const breadcrumbItems = [
        { label: t('Product.home'), href: `/${locale}` },
        { label: page.title, href: `/${locale}/${page.slug}`, active: true },
    ];

    const pageTypeLabel =
        locale === 'ar'
            ? page.type === 'html'
                ? 'مقالة'
                : 'معلومات'
            : page.type === 'html'
              ? 'Article'
              : 'Information';

    const updatedAt = page.updated_at || page.created_at;
    const formattedDate = updatedAt
        ? new Date(updatedAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : null;

    // ✅ Sanitize HTML content for security
    const safeHTML =
        page.type === 'html' ? sanitizeHTML(page.content || '') : '';

    return (
        <section className="min-h-screen bg-linear-to-b from-white to-gray-50/40 py-10 lg:py-8 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-theme-primary/10 blur-[120px]" />
                <div className="absolute top-1/3 -left-16 h-56 w-56 rounded-full bg-theme-secondary/10 blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 mt-2  md:mt-16 ">
                <Breadcrumbs items={breadcrumbItems} />

                <article className="mt-6 lg:mt-10 space-y-8">
                    <header className="rounded-3xl border border-gray-100 bg-white/80 px-6 py-8 shadow-sm backdrop-blur-sm md:px-10">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-2 rounded-full bg-theme-primary/10 px-3 py-1 font-semibold text-theme-primary">
                                <FileText className="h-4 w-4" />
                                {pageTypeLabel}
                            </span>
                            {formattedDate && (
                                <span className="inline-flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {locale === 'ar'
                                            ? `آخر تحديث: ${formattedDate}`
                                            : `Updated: ${formattedDate}`}
                                    </span>
                                </span>
                            )}
                        </div>

                        <h1 className="mt-5 text-3xl font-black leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                            {page.title}
                        </h1>

                        {page.description && (
                            <p className="mt-4 text-lg leading-relaxed text-gray-600">
                                {page.description}
                            </p>
                        )}
                    </header>

                    <section className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
                        {!page.content && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <AlertCircle className="w-12 h-12 mb-4" />
                                <p>No content available for this page.</p>
                            </div>
                        )}

                        {page.type === 'html' ? (
                            <div
                                className="cms-content prose prose-lg max-w-none text-gray-700
                                    prose-headings:font-black prose-headings:text-gray-900
                                    prose-p:leading-relaxed
                                    prose-strong:text-theme-primary prose-strong:font-semibold
                                    prose-a:text-theme-primary prose-a:underline-offset-4 hover:prose-a:text-theme-secondary
                                    prose-ul:list-disc prose-ul:ms-6 rtl:prose-ul:me-6 rtl:prose-ul:ms-0
                                    prose-ol:list-decimal prose-ol:ms-6 rtl:prose-ol:me-6 rtl:prose-ol:ms-0
                                    prose-img:rounded-2xl prose-img:shadow-lg"
                                dangerouslySetInnerHTML={{ __html: safeHTML }}
                                suppressHydrationWarning
                            />
                        ) : (
                            <div className="whitespace-pre-line text-lg leading-relaxed text-gray-700">
                                {page.content}
                            </div>
                        )}
                    </section>

                    <footer
                        className="text-center text-xs text-gray-400"
                        suppressHydrationWarning>
                        © {new Date().getFullYear()} {site.name}
                    </footer>
                </article>
            </div>
        </section>
    );
}

// ISR configuration - keep literal for Next segment config validation
export const revalidate = 604800;
export const dynamicParams = true;
