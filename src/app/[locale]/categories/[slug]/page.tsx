// src/app/[locale]/categories/[slug]/page.tsx

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { storeService } from '@/services/store-service';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CategoryContent from '@/components/pages/categories/CategoryContent';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;

    try {
        let category = await storeService
            .getCategoryBySlug(slug)
            .catch(() => null);
        if (!category) {
            category = await storeService.getCategory(slug).catch(() => null);
        }

        if (!category) return { title: 'Category Not Found' };

        return {
            title: category.name,
            description: category.description || category.name,
        };
    } catch {
        return { title: 'Category Not Found' };
    }
}

export default async function CategoryPage({ params }: Props) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: 'Category' });

    try {
        // Try fetching by slug first
        let category = await storeService
            .getCategoryBySlug(slug)
            .catch(() => null);

        // Fallback to fetch by ID if slug not found (slug might actually be an ID string)
        if (!category) {
            category = await storeService.getCategory(slug).catch(() => null);
        }

        if (!category) notFound();

        // Fetch all categories for the tree/sidebar
        const allCategories = await storeService
            .getCategories(true)
            .catch(() => []);

        const breadcrumbItems = [
            { label: t('home'), href: '/' },
            { label: t('categories'), href: '/categories' },
            { label: category.name, href: `/categories/${slug}`, active: true },
        ];

        return (
            <main className="min-h-screen bg-gray-50/30 py-8">
                <div className="container mx-auto px-4">
                    <Breadcrumbs items={breadcrumbItems} />

                    <CategoryContent initialCategory={category} />
                </div>
            </main>
        );
    } catch (error) {
        notFound();
    }
}
