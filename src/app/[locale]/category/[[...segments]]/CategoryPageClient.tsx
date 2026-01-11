'use client';

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { storeService } from '@/services/store-service';
import type { Category, Product } from '@/services/types';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CategoryHierarchy from './CategoryHierarchy';
import ProductsSection from './ProductsSection';
import { buildCategoryPath, normalizeSegments } from './utils';
import { QUERY_CONFIG } from './constants';

interface CategoryPageClientProps {
    locale: string;
    initialTree: Category[];
    initialCategoryPath: Category[];
    initialProducts: Product[];
    segments: string[];
}

/**
 * Builds breadcrumb items with proper category names from the tree.
 */
const buildBreadcrumbs = (
    categoryPath: Category[],
    t: ReturnType<typeof useTranslations>,
): Array<{ label: string; href: string }> => {
    const items = [
        { label: t('home'), href: '/' },
        { label: t('categories'), href: '/category' },
    ];

    const pathSegments: string[] = [];
    for (const category of categoryPath) {
        if (category.slug) {
            pathSegments.push(category.slug);
            items.push({
                label: category.name,
                href: `/category/${pathSegments.join('/')}`,
            });
        }
    }

    return items;
};

export default function CategoryPageClient({
    locale,
    initialTree,
    initialCategoryPath,
    initialProducts,
    segments: initialSegments,
}: CategoryPageClientProps) {
    const t = useTranslations('Category');
    const params = useParams();

    // Get current segments from URL (for client-side navigation)
    const currentSegments = useMemo(
        () =>
            normalizeSegments(params.segments as string | string[] | undefined),
        [params.segments],
    );

    // Use current segments from URL, fallback to initial segments
    const segments = useMemo(
        () => (currentSegments.length > 0 ? currentSegments : initialSegments),
        [currentSegments, initialSegments],
    );

    // Rebuild category path based on current segments (memoized)
    const categoryPath = useMemo(
        () => buildCategoryPath(initialTree, segments),
        [initialTree, segments],
    );

    const currentCategory = useMemo(
        () => categoryPath[categoryPath.length - 1] || null,
        [categoryPath],
    );

    const categoryId = currentCategory?.id;

    // Optimized query key generation
    const queryKey = useMemo(
        () => [
            'products',
            'category',
            segments.length > 0 ? segments.join('/') : 'all',
        ],
        [segments],
    );

    // Memoized query function
    const fetchProducts = useCallback(async () => {
        const result = await storeService.getProducts({
            ...(categoryId ? { category_id: categoryId.toString() } : {}),
        });
        return result.data;
    }, [categoryId]);

    const {
        data: productsResult,
        isLoading: isLoadingProducts,
        isFetching: isFetchingProducts,
        error: productsError,
    } = useQuery({
        queryKey,
        queryFn: fetchProducts,
        initialData: initialProducts,
        staleTime: QUERY_CONFIG.STALE_TIME,
        gcTime: QUERY_CONFIG.GC_TIME,
        retry: QUERY_CONFIG.RETRY,
        retryDelay: QUERY_CONFIG.RETRY_DELAY,
        enabled: true,
        placeholderData: (previousData) => previousData, // Keep previous data while fetching
    });

    // Memoize breadcrumbs
    const breadcrumbItems = useMemo(
        () => buildBreadcrumbs(categoryPath, t),
        [categoryPath, t],
    );

    const products = productsResult || initialProducts;
    const mainRef = useRef<HTMLElement>(null);
    const prevSegmentsRef = useRef<string>(segments.join('/'));

    // Prevent scroll jump on category navigation
    useEffect(() => {
        const currentPath = segments.join('/');
        if (prevSegmentsRef.current !== currentPath && mainRef.current) {
            // Only maintain scroll if user has scrolled down
            const scrollY = window.scrollY;
            if (scrollY > 100) {
                // Small delay to let DOM update, then restore scroll
                requestAnimationFrame(() => {
                    window.scrollTo({
                        top: scrollY,
                        behavior: 'auto', // Instant to prevent visible jump
                    });
                });
            }
            prevSegmentsRef.current = currentPath;
        }
    }, [segments]);

    return (
        <main
            ref={mainRef}
            className="container mx-auto px-4 py-12 space-y-12 min-h-screen"
            style={{ scrollBehavior: 'smooth' }}>
            {/* Hierarchical Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Hierarchical Category Navigation */}
            <section className="space-y-6">
                <h1
                    key={currentCategory?.id || 'root'}
                    className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight animate-in fade-in slide-in-from-top-4 duration-300">
                    {currentCategory?.name || t('categories')}
                </h1>

                <CategoryHierarchy
                    tree={initialTree}
                    categoryPath={categoryPath}
                />
            </section>

            {/* Products Section */}
            <ProductsSection
                products={products}
                isLoading={isLoadingProducts}
                isFetching={isFetchingProducts}
            />

            {/* Error State */}
            {productsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 animate-in fade-in duration-300">
                    <p className="text-red-800 text-sm">
                        {t('error_loading_products') ||
                            'Failed to load products. Please try again.'}
                    </p>
                </div>
            )}
        </main>
    );
}
