// src/app/[locale]/offers/page.tsx
import React, { Suspense } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { storeService } from '@/services/store-service';
import { generateCollectionStructuredData } from '@/lib/metadata';
import OffersView from '@/components/pages/collections/OffersView';
import OffersPageSkeleton from './OffersPageSkeleton';

interface SearchParams {
    collection_id?: string;
    page?: string;
    per_page?: string;
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { collection_id } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Collections' });

    let collectionName: string | undefined;
    if (collection_id) {
        try {
            const collections = await storeService.getCollections();
            const collection = collections.find(
                (c) => c.id === Number(collection_id),
            );
            collectionName = collection?.name;
        } catch {
            // Silently fail
        }
    }

    const baseTitle = t('title');
    const title = collectionName
        ? `${baseTitle} - ${collectionName}`
        : baseTitle;

    return {
        title,
        description: collectionName
            ? t('descriptionWithCollection', { collection: collectionName })
            : t('description'),
        alternates: {
            canonical: collection_id
                ? `/offers?collection_id=${collection_id}`
                : '/offers',
        },
    };
}

export default async function OffersPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<SearchParams>;
}) {
    const { locale } = await params;
    const filters = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Collections' });
    const queryClient = getQueryClient();

    // Fetch collections once - cached at service level
    const collections = await storeService.getCollections();

    // Prefetch collections into queryClient
    queryClient.setQueryData(['collections'], collections);

    // Prefetch products if collection_id is provided
    let productsResult = null;
    if (filters.collection_id) {
        const productFilters = {
            collection_id: filters.collection_id,
            page: filters.page || '1',
            per_page: filters.per_page || '12',
        };

        // Fetch once for both hydration and SEO
        productsResult = await storeService.getProducts(productFilters);
        queryClient.setQueryData(['products', productFilters], productsResult);
    }

    // Generate structured data reusing the already fetched productsResult
    let structuredData = null;
    if (filters.collection_id && productsResult) {
        const collection = collections.find(
            (c) => c.id === Number(filters.collection_id),
        );
        if (collection) {
            const siteUrl =
                process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';
            structuredData = generateCollectionStructuredData(
                productsResult.data,
                siteUrl,
                collection.name,
            );
        }
    }

    return (
        <>
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            )}
            <main className="min-h-screen bg-gray-50/30">
                <div className="container mx-auto px-4 pt-6">
                    <Breadcrumbs
                        items={[
                            { label: t('home'), href: '/' },
                            { label: t('title') },
                        ]}
                    />
                </div>

                <Suspense fallback={<OffersPageSkeleton />}>
                    <HydrationBoundary state={dehydrate(queryClient)}>
                        <OffersView />
                    </HydrationBoundary>
                </Suspense>
            </main>
        </>
    );
}
