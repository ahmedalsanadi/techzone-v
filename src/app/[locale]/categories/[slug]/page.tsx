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

export default async function CategoryPage({ params }: Props) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: 'Category' });

    // 1. Fetch the categories tree first (cached)
    const allCategories = await storeService
        .getCategories(true)
        .catch(() => []);

    // 2. Find category in tree first (most reliable as links come from this tree)
    let category = findCategory(allCategories, slug);

    // 3. Last resort: Try individual API fetch if not in tree
    if (!category) {
        category = await storeService.getCategoryBySlug(slug).catch(() => null);

        if (!category && !isNaN(Number(slug))) {
            category = await storeService.getCategory(slug).catch(() => null);
        }
    }

    // 4. If absolutely not found, then 404
    if (!category) {
        console.warn(`[Category 404] Could not find category: ${slug}`);
        return notFound();
    }

    // 5. Fetch products (failure here should NOT 404)
    const productsResult = await storeService
        .getProducts({
            category_id: category.id.toString(),
            page: '1',
        })
        .catch((err) => {
            console.error(`[Products Fetch Error] ${category.name}:`, err);
            return null;
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

            <CategoryContent
                initialCategory={category}
                initialProducts={productsResult}
            />
        </main>
    );
}
