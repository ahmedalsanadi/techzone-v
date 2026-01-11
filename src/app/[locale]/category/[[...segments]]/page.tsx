// src/app/[locale]/category/[[...segments]]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { storeService } from '@/services/store-service';
import { getTranslations } from 'next-intl/server';
import CategoryPageClient from './CategoryPageClient';
import {
    findCategoryByPath,
    buildCategoryPath,
    getRootCategories,
} from './utils';

interface Props {
    params: Promise<{ locale: string; segments?: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;
    const segments = resolvedParams.segments ?? [];
    const tree = await storeService.getCategories(true);
    const t = await getTranslations({ locale, namespace: 'Category' });

    if (segments.length === 0) {
        return {
            title: t('categories'),
            description: t('categories_description') || t('categories'),
            alternates: {
                canonical: `/${locale}/category`,
            },
            openGraph: {
                title: t('categories'),
                description: t('categories_description') || t('categories'),
                url: `/${locale}/category`,
                type: 'website',
            },
        };
    }

    const category = findCategoryByPath(tree, segments);
    if (!category) {
        return {
            title: 'Category Not Found',
            description: 'The requested category could not be found.',
        };
    }

    const categoryPath = buildCategoryPath(tree, segments);
    const breadcrumbPath = categoryPath.map((c) => c.name).join(' > ');
    const canonicalUrl = `/${locale}/category/${segments.join('/')}`;

    const categoryDescription =
        category.description ||
        `${t('products')} ${category.name} - ${breadcrumbPath}`;

    return {
        title: `${category.name} - ${t('categories')}`,
        description: categoryDescription,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: category.name,
            description: categoryDescription,
            url: canonicalUrl,
            type: 'website',
            ...(category.image_url && {
                images: [
                    {
                        url: category.image_url,
                        alt: category.name,
                    },
                ],
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: category.name,
            description: categoryDescription,
            ...(category.image_url && {
                images: [category.image_url],
            }),
        },
    };
}

export default async function CategoryPage({ params }: Props) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;
    // Handle optional catch-all: segments can be undefined or an array
    const segments = resolvedParams.segments ?? [];
    // const t = await getTranslations({ locale, namespace: 'Category' });

    // Fetch category tree
    const tree = await storeService.getCategories(true);

    // Build the full path from root to current category
    const categoryPath = buildCategoryPath(tree, segments);
    const currentCategory = categoryPath[categoryPath.length - 1] || null;

    // Fallback if segments exist but category isn't found
    if (segments.length > 0 && !currentCategory) {
        notFound();
    }

    // Get products for the current category, or all products if no category selected
    const categoryId = currentCategory?.id;
    const { data: products } = await storeService.getProducts({
        ...(categoryId ? { category_id: categoryId.toString() } : {}),
    });

    return (
        <CategoryPageClient
            locale={locale}
            initialTree={tree}
            initialCategoryPath={categoryPath}
            initialProducts={products}
            segments={segments}
        />
    );
}
