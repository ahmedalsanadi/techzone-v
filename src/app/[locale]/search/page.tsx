// src/app/[locale]/search/page.tsx
import React, { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SearchContent from '@/components/search/SearchContent';

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { q } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Search' });

    return {
        title: q ? `${t('results_for')} "${q}"` : t('search'),
        description: t('search_description'),
    };
}

export default async function SearchPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { locale } = await params;
    const { q: query } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Search' });

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('search'), href: '/search', active: true },
    ];

    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-4">
                <Breadcrumbs items={breadcrumbItems} />

                <h1 className="text-3xl font-bold mt-8 mb-6">
                    {query ? (
                        <>
                            {t('results_for')}{' '}
                            <span className="text-primary">
                                &ldquo;{query}&rdquo;
                            </span>
                        </>
                    ) : (
                        t('search_products')
                    )}
                </h1>

                <Suspense fallback={<div>Loading...</div>}>
                    <SearchContent initialQuery={query} />
                </Suspense>
            </div>
        </main>
    );
}
