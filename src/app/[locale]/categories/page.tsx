// src/app/[locale]/categories/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

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

import CategoryContent from '@/components/categories/CategoryContent';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';

export default async function CategoriesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Category' });

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('categories'), href: '/categories', active: true },
    ];

    const queryClient = getQueryClient();

    return (
        <div className="space-y-4">
            <Breadcrumbs items={breadcrumbItems} />

            <HydrationBoundary state={dehydrate(queryClient)}>
                <CategoryContent />
            </HydrationBoundary>
        </div>
    );
}
