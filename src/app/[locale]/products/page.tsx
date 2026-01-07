//src/app/[locale]/products/page.tsx
import React, { Suspense } from 'react';
import ProductsContent from '@/components/pages/products/ProductsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { storeService } from '@/services/store-service';
import { generateCollectionStructuredData } from '@/lib/metadata';
import { siteConfig } from '@/config/site';

async function ContentDataWrapper({ 
    locale,
    categorySlug, 
    category_id 
}: { 
    locale: string;
    categorySlug?: string; 
    category_id?: string 
}) {
    const queryClient = getQueryClient();

    // Prefetch in parallel - cache() handles deduplication
    const [productsResult] = await Promise.all([
        storeService.getProducts({ category_id }),
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: () => storeService.getCategories(true),
        })
    ]);

    // Also prime the query cache with the products we just fetched
    queryClient.setQueryData(['products', category_id || ''], productsResult);

    const structuredData = generateCollectionStructuredData(
        productsResult.data,
        siteConfig.url
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            )}
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
                    {/* Category Tabs Skeleton */}
                    <div className="h-[70px] mb-8 flex justify-center gap-4 overflow-hidden">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 w-24 bg-gray-100 animate-pulse rounded-2xl shrink-0" />
                        ))}
                    </div>
                    {/* Subcategories Skeleton */}
                    <div className="h-[120px] bg-gray-50/50 border border-gray-100 rounded-[32px] mb-10 mx-4 animate-pulse flex items-center px-8 gap-10">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-full bg-gray-100" />
                                <div className="h-2 w-10 bg-gray-100 rounded" />
                            </div>
                        ))}
                    </div>
                    {/* Products Grid Skeleton - Matches ProductCard exactly */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-sm">
                                <div className="w-full aspect-square bg-gray-50 rounded-2xl animate-pulse mb-6" />
                                <div className="w-full space-y-3">
                                    <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse" />
                                    <div className="flex justify-between items-center">
                                        <div className="h-6 bg-gray-100 rounded-md w-1/3 animate-pulse" />
                                        <div className="h-4 bg-gray-100 rounded-md w-1/4 animate-pulse" />
                                    </div>
                                    <div className="h-12 bg-gray-50 rounded-xl w-full animate-pulse mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }>
                <ContentDataWrapper 
                    locale={locale}
                    categorySlug={categorySlug} 
                    category_id={category_id} 
                />
            </Suspense>
        </main>
    );
}
