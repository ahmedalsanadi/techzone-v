// src/app/[locale]/categories/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { storeService } from '@/services/store-service';
// import { Link } from '@/i18n/navigation';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Category' });

    return {
        title: t('categories'),
        description: t('categories_description'),
    };
}

import CategoryContent from '@/components/pages/categories/CategoryContent';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';

export default async function CategoriesPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { locale } = await params;
    const { page = '1' } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Category' });
    // const categories = await storeService.getCategories(true);

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('categories'), href: '/categories', active: true },
    ];

    const queryClient = getQueryClient();
    const filters = {
        page,
        per_page: '8',
    };

    await queryClient.prefetchQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
    });

    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-4 mb-4">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <HydrationBoundary state={dehydrate(queryClient)}>
                <CategoryContent />
            </HydrationBoundary>
        </main>
    );
}
