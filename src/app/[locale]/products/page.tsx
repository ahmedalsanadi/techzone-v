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
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string; category_id?: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { category, category_id } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Product' });

    let pageTitle = t('products');

    // If category is selected, try to get its title
    if (category_id || category) {
        try {
            const categories = await storeService.getCategories();
            const selectedCat = categories.find(
                (c) => c.slug === category || c.id.toString() === category_id
            );
            if (selectedCat) {
                pageTitle = selectedCat.name;
            }
        } catch (e) {
            /* Fallback to generic title */
        }
    }

    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (category_id) query.set('category_id', category_id);
    const queryString = query.toString();

    return generatePageMetadata({
        locale,
        title: pageTitle,
        path: `/products${queryString ? `?${queryString}` : ''}`,
    });
}

async function ProductsContentWrapper({ 
    categorySlug, 
    category_id 
}: { 
    categorySlug?: string; 
    category_id?: string 
}) {
    const queryClient = getQueryClient();

    // Prefetch data on the server
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
                    <div className="h-12 bg-gray-100 animate-pulse rounded-2xl mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="bg-gray-100 animate-pulse rounded-3xl aspect-square" />
                        ))}
                    </div>
                </div>
            }>
                <ProductsContentWrapper 
                    categorySlug={categorySlug} 
                    category_id={category_id} 
                />
            </Suspense>
        </main>
    );
}
