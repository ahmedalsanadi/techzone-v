// src/app/[locale]/category/[slug]/page.tsx
import React, { Suspense } from 'react';
import ProductsContent from '@/components/pages/products/ProductsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { storeService } from '@/services/store-service';
import { generateCollectionStructuredData } from '@/lib/metadata';
import { siteConfig } from '@/config/site';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string; locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;

    try {
        const categories = await storeService.getCategories(true);
        const category = categories.find((cat) => cat.slug === slug);

        if (!category) {
            return { title: 'Category Not Found' };
        }

        return {
            title: category.name,
            description: category.description,
            alternates: {
                canonical: `/category/${slug}`,
            },
        };
    } catch (error) {
        return { title: 'Category Not Found' };
    }
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { slug, locale } = await params;
    const filters = await searchParams;

    try {
        const categories = await storeService.getCategories(true);
        const category = categories.find((cat) => cat.slug === slug);

        if (!category) {
            notFound();
        }

        const t = await getTranslations({ locale, namespace: 'Product' });

        const breadcrumbItems = [
            { label: t('home'), href: '/' },
            { label: t('products'), href: '/products' },
            { label: category.name, active: true },
        ];

        // Merge category ID with existing search params
        const mergedFilters = {
            ...Object.fromEntries(
                Object.entries(filters).map(([k, v]) => [
                    k,
                    typeof v === 'string' ? v : v?.[0],
                ]),
            ),
            category_id: category.id.toString(),
        };

        return (
            <main className="min-h-screen bg-gray-50/30">
                <div className="container mx-auto px-4 pt-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <ProductsContent initialFilters={mergedFilters} />
                </Suspense>
            </main>
        );
    } catch (error) {
        notFound();
    }
}
