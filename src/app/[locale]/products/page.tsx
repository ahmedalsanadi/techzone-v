// src/app/[locale]/products/page.tsx
import React, { Suspense } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductsView from '@/components/products/ProductsView';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { storeService } from '@/services/store-service';
import ProductsPageSkeleton from './ProductsPageSkeleton';

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
    const queryClient = getQueryClient();

    // Prefetch initial data
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['products', { ...filters, per_page: '8' }],
            queryFn: () =>
                storeService.getProducts({ ...filters, per_page: '8' }),
        }),
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: () => storeService.getCategories(true),
        }),
    ]);

    return (
        <main className="min-h-screen bg-gray-50/30 py-12 px-4">
            <div className="container mx-auto px-4 pt-6">
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('products') },
                    ]}
                />
            </div>

            <Suspense fallback={<ProductsPageSkeleton />}>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <ProductsView />
                </HydrationBoundary>
            </Suspense>
        </main>
    );
}
