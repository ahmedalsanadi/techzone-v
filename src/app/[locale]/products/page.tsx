import React, { Suspense } from 'react';
import ProductsContent from '@/components/pages/products/ProductsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { storeService } from '@/services/store-service';
import { generatePageMetadata } from '@/lib/metadata';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Product' });

    // Conventional E-commerce SEO: Keep the main products title stable 
    // even when filtering by categories via query parameters.
    return generatePageMetadata({
        locale,
        title: t('products'),
        path: '/products',
    });
}

/**
 * Optimized Wrapper that handles nested hydration.
 * This allows Categories to render while Products are still fetching.
 */
async function ContentDataWrapper({ 
    categorySlug, 
    category_id 
}: { 
    categorySlug?: string; 
    category_id?: string 
}) {
    const queryClient = getQueryClient();

    // Prefetch in parallel - cache() handles deduplication
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: () => storeService.getCategories(true),
        }),
        queryClient.prefetchQuery({
            queryKey: ['products', category_id || ''],
            queryFn: () => storeService.getProducts({ category_id }),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsContent initialCategorySlug={categorySlug} initialCategoryId={category_id} />
        </HydrationBoundary>
    );
}

export default async function ProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string; category_id?: string }>;
}) {
    const { locale } = await params;
    const { category: categorySlug, category_id } = await searchParams;
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
            
            <Suspense fallback={
                <div className="container mx-auto py-8 px-4">
                    <div className="h-14 bg-gray-200/50 animate-pulse rounded-2xl mb-8 w-full max-w-3xl mx-auto" />
                    <div className="h-24 bg-gray-100/50 animate-pulse rounded-[32px] mb-10 mx-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-3xl aspect-4/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            }>
                <ContentDataWrapper 
                    categorySlug={categorySlug} 
                    category_id={category_id} 
                />
            </Suspense>
        </main>
    );
}
