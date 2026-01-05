import React from 'react';
import ProductsContent from '@/components/pages/products/ProductsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import {
    fetchCategories,
    fetchProducts,
    CATEGORIES,
    Category,
} from '@/data/mock-data';

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { category } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Product' });
    const tc = await getTranslations({ locale, namespace: 'Categories' });

    let title = `${t('products')} | ${siteConfig.name}`;
    if (category) {
        // Find category name by slug
        const cat = CATEGORIES.find((c: Category) => c.slug === category);
        if (cat) {
            title = `${tc(cat.key)} | ${siteConfig.name}`;
        }
    }

    return {
        title,
        description: t('description'),
        alternates: {
            canonical: `${siteConfig.url}/${locale}/products${
                category ? `?category=${category}` : ''
            }`,
        },
        openGraph: {
            title,
            description: t('description'),
            url: `${siteConfig.url}/${locale}/products${
                category ? `?category=${category}` : ''
            }`,
            type: 'website',
        },
    };
}

export default async function ProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { locale } = await params;
    const { category: categorySlug } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Product' });
    const queryClient = getQueryClient();

    // Prefetch data on the server
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: fetchCategories,
        }),
        queryClient.prefetchQuery({
            queryKey: ['products'],
            queryFn: fetchProducts,
        }),
    ]);

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('products'), href: '/products', active: true },
    ];

    return (
        <main className="min-h-screen bg-gray-50/30">
            <div className="container mx-auto px-4 pt-6">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ProductsContent initialCategorySlug={categorySlug} />
            </HydrationBoundary>
        </main>
    );
}
