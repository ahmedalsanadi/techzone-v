// src/app/[locale]/offers/page.tsx
import React, { Suspense } from 'react';
import CollectionsContent from '@/components/pages/collections/CollectionsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { storeService } from '@/services/store-service';
import { generateCollectionStructuredData } from '@/lib/metadata';

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

    // Try to get collection name for better SEO
    let collectionName: string | undefined;
    if (collection_id) {
        try {
            const collections = await storeService.getCollections();
            const collection = collections.find(
                (c) => c.id === Number(collection_id),
            );
            collectionName = collection?.name;
        } catch {
            // Silently fail - use default title
        }
    }

    // Only override what's specific to this page
    // Layout already provides template "%s | Fasto", default description, openGraph, etc.
    // We just add the collection name to the title if available
    const baseTitle = t('title');
    const title = collectionName
        ? `${baseTitle} - ${collectionName}`
        : baseTitle;

    return {
        title, // Uses template from layout: "%s | Fasto" -> "Special Offers & Collections - {Collection} | Fasto"
        description: collectionName
            ? t('descriptionWithCollection', { collection: collectionName })
            : t('description'),
        // Only override canonical URL (layout handles language alternates globally)
        alternates: {
            canonical: collection_id
                ? `/offers?collection_id=${collection_id}`
                : '/offers',
        },
    };
}

async function ContentDataWrapper({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const queryClient = getQueryClient();

    // Prefetch collections
    await queryClient.prefetchQuery({
        queryKey: ['collections'],
        queryFn: () => storeService.getCollections(),
    });

    // Prefetch products if collection_id is provided
    if (searchParams.collection_id) {
        await queryClient.prefetchQuery({
            queryKey: [
                'products',
                {
                    collection_id: searchParams.collection_id,
                    page: searchParams.page || '1',
                    per_page: searchParams.per_page || '12',
                },
            ],
            queryFn: () =>
                storeService.getProducts({
                    collection_id: searchParams.collection_id,
                    page: searchParams.page || '1',
                    per_page: searchParams.per_page || '12',
                }),
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CollectionsContent
                initialCollectionId={searchParams.collection_id}
            />
        </HydrationBoundary>
    );
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

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title'), href: '/offers', active: true },
    ];

    // Generate structured data for SEO
    let structuredData = null;
    if (filters.collection_id) {
        try {
            const collections = await storeService.getCollections();
            const collection = collections.find(
                (c) => c.id === Number(filters.collection_id),
            );
            if (collection) {
                const productsResult = await storeService.getProducts({
                    collection_id: filters.collection_id,
                    per_page: '12',
                });
                const siteUrl =
                    process.env.NEXT_PUBLIC_SITE_URL ||
                    (process.env.VERCEL_URL
                        ? `https://${process.env.VERCEL_URL}`
                        : 'https://localhost:3000');
                structuredData = generateCollectionStructuredData(
                    productsResult.data,
                    siteUrl,
                    collection.name,
                );
            }
        } catch {
            // Silently fail - no structured data
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
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <Suspense fallback={<OffersPageSkeleton />}>
                    <ContentDataWrapper searchParams={filters} />
                </Suspense>
            </main>
        </>
    );
}

function OffersPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* Header skeleton */}
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Collections skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-4/3 bg-gray-200 rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>

                {/* Products skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 bg-gray-200 rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
