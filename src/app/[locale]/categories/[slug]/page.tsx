// src/app/[locale]/categories/[slug]/page.tsx

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { storeService } from '@/services/store-service';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CategoryContent from '@/components/pages/categories/CategoryContent';
import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

const findCategory = (nodes: any[], slug: string): any | null => {
    for (const node of nodes) {
        if (node.slug === slug || node.id.toString() === slug) return node;
        if (node.children?.length) {
            const found = findCategory(node.children, slug);
            if (found) return found;
        }
    }
    return null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        // Fetch categories tree (cached)
        const allCategories = await storeService
            .getCategories(true)
            .catch(() => []);

        // Find category locally first
        let category = findCategory(allCategories, slug);

        // Fallback to individual fetch
        if (!category) {
            category = await storeService
                .getCategoryBySlug(slug)
                .catch(() => null);
            if (!category && !isNaN(Number(slug))) {
                category = await storeService
                    .getCategory(slug)
                    .catch(() => null);
            }
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

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string; slug: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { locale, slug } = await params;
    const { page = '1' } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Category' });

    // 1. Fetch the categories tree first (cached)
    const allCategories = await storeService
        .getCategories(true)
        .catch(() => []);

    // 2. Find category in tree first
    let category = findCategory(allCategories, slug);

    // 3. Fallback fetch
    if (!category) {
        category = await storeService.getCategoryBySlug(slug).catch(() => null);
        if (!category && !isNaN(Number(slug))) {
            category = await storeService.getCategory(slug).catch(() => null);
        }
    }

    if (!category) return notFound();

    const queryClient = getQueryClient();

    // 4. Prefetch products for the correct page
    const filters = {
        category_id: category.id.toString(),
        page,
        per_page: '10',
    };

    await queryClient.prefetchQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
    });

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('categories'), href: '/categories' },
        { label: category.name, href: `/categories/${slug}`, active: true },
    ];

    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-4 mb-6">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <HydrationBoundary state={dehydrate(queryClient)}>
                <CategoryContent initialCategory={category} />
            </HydrationBoundary>
        </main>
    );
}
