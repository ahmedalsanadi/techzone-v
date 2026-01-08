// src/app/[locale]/products/page.tsx
import React, { Suspense } from 'react';
import ProductsContent from '@/components/pages/products/ProductsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { storeService } from '@/services/store-service';

interface SearchParams {
    [key: string]: string | undefined;
    search?: string;
    category_id?: string;
    brand_id?: string;
    is_featured?: string;
    is_latest?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
    order?: string;
    page?: string;
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Product' });

    return {
        title: t('products'),
        description: t('products_description'),
        openGraph: {
            title: t('products'),
            description: t('products_description'),
            type: 'website',
        },
        alternates: {
            canonical: '/products',
            languages: {
                en: '/en/products',
                ar: '/ar/products',
            },
        },
    };
}

async function ContentDataWrapper({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const queryClient = getQueryClient();

    // Prefetch initial data
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['products', searchParams],
            queryFn: () => storeService.getProducts(searchParams),
        }),
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: () => storeService.getCategories(true),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsContent initialFilters={searchParams} />
        </HydrationBoundary>
    );
}

export default async function ProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<SearchParams>;
}) {
    const { locale } = await params;
    const filters = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Product' });

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('products'), href: '/products', active: true },
    ];

    return (
        <main className="min-h-screen bg-gray-50/30">
            <div className="container mx-auto px-4 pt-6">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <Suspense fallback={<ProductsPageSkeleton />}>
                <ContentDataWrapper searchParams={filters} />
            </Suspense>
        </main>
    );
}

function ProductsPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters skeleton */}
                <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-32 bg-gray-200 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
                {/* Products skeleton */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 bg-gray-200 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
