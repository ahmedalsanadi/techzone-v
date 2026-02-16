// src/app/[locale]/offers/page.tsx
import React, { Suspense } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { resolveSiteIdentity } from '@/lib/tenant/resolve-site';
import OffersView from '@/components/offers/OffersView';
import OffersPageSkeleton from './OffersPageSkeleton';

interface SearchParams {
    collection_id?: string;
    page?: string;
    per_page?: string;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Collections' });
    const site = await resolveSiteIdentity();

    return {
        title: t('title'),
        description: t('description'),
        metadataBase: new URL(site.url),
        // Conventional SEO: filter/query pages should not be indexed.
        robots: {
            index: false,
            follow: true,
        },
        alternates: {
            canonical: `${site.url}/${locale}/offers`,
        },
    };
}

export default async function OffersPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Collections' });

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[{ label: t('home'), href: '/' }, { label: t('title') }]}
            />

            <Suspense fallback={<OffersPageSkeleton />}>
                <OffersView />
            </Suspense>
        </div>
    );
}
