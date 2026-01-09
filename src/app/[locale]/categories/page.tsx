// src/app/[locale]/categories/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { storeService } from '@/services/store-service';
import CategoryCard from '@/components/ui/CategoryCard';
import { Link } from '@/i18n/navigation';

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

export default async function CategoriesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Category' });
    const categories = await storeService.getCategories(true);

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('categories'), href: '/categories', active: true },
    ];

    // Fetch initial products for "All" or first page
    const productsResult = await storeService
        .getProducts({ page: '1' })
        .catch(() => null);

    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-4 mb-4">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <CategoryContent initialProducts={productsResult} />
        </main>
    );
}
