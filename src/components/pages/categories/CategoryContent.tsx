// src/components/pages/categories/CategoryContent.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { Category } from '@/services/types';
import SubCategorySelection from '@/components/pages/products/SubCategorySelection';
import ProductsGrid from '@/components/pages/products/ProductsGrid';
import ProductsSorting from '@/components/pages/products/ProductsSorting';
import { useTranslations } from 'next-intl';
import CategoryTabs from '@/components/pages/products/CategoryTabs';
import { cn } from '@/lib/utils';

import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useStore } from '@/components/providers/StoreProvider';

interface CategoryContentProps {
    initialCategory?: Category;
}

const CategoryContent = ({ initialCategory }: CategoryContentProps) => {
    const t = useTranslations('Category');
    const { categories: allCategories } = useStore();
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const slug = params.slug as string;
    const page = searchParams.get('page') || '1';
    const sort = searchParams.get('sort') || undefined;
    const order = searchParams.get('order') || undefined;

    // Helper to find the current active path from the global tree
    // This allows us to support multi-level deep linking automatically
    const getActivePath = (
        nodes: Category[],
        targetSlug: string,
        currentPath: Category[] = [],
    ): Category[] | null => {
        for (const node of nodes) {
            if (node.slug === targetSlug || node.id.toString() === targetSlug) {
                return [...currentPath, node];
            }
            if (node.children?.length) {
                const found = getActivePath(node.children, targetSlug, [
                    ...currentPath,
                    node,
                ]);
                if (found) return found;
            }
        }
        return null;
    };

    const activePath = getActivePath(allCategories, slug) || [];
    const currentCategory =
        activePath[activePath.length - 1] || initialCategory;
    const currentSubCategories = currentCategory?.children || [];

    const filters = {
        sort,
        order,
        page,
    };

    const {
        data: productsResult,
        isLoading,
        error,
    } = useQuery({
        queryKey: [
            'products',
            { ...filters, category_id: currentCategory?.id.toString() },
        ],
        queryFn: () =>
            storeService.getProducts({
                ...filters,
                category_id: currentCategory?.id.toString(),
            }),
        retry: 1,
    });

    const updateUrl = (newPath: string, newParams?: Record<string, string>) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        if (newParams) {
            Object.entries(newParams).forEach(([k, v]) => {
                if (v) currentParams.set(k, v);
                else currentParams.delete(k);
            });
        }
        router.push(`${newPath}?${currentParams.toString()}`);
    };

    const handleMainCategorySelect = (id: string) => {
        if (id === 'all') {
            router.push('/categories');
        } else {
            const selected = allCategories.find((c) => c.id.toString() === id);
            if (selected) {
                router.push(`/categories/${selected.slug || selected.id}`);
            }
        }
    };

    const handleSubCategorySelect = (id: string) => {
        const selected = currentSubCategories.find(
            (c) => c.id.toString() === id,
        );
        if (selected) {
            router.push(`/categories/${selected.slug || selected.id}`);
        }
    };

    const handleLevelReset = (levelIndex: number) => {
        const target = activePath[levelIndex];
        if (target) {
            router.push(`/categories/${target.slug || target.id}`);
        }
    };

    const handleSortChange = (
        sort: string | undefined,
        order: string | undefined,
    ) => {
        updateUrl(window.location.pathname, {
            sort: sort || '',
            order: order || '',
            page: '1',
        });
    };

    const handlePageChange = (page: number) => {
        updateUrl(window.location.pathname, { page: page.toString() });
    };

    return (
        <div className="space-y-6">
            {/* Top Level Category Tabs */}
            <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm -mx-4 px-4 py-4 border-b border-gray-100 mb-4 overflow-hidden">
                <CategoryTabs
                    categories={allCategories}
                    activeCategoryId={activePath[0]?.id.toString() || 'all'}
                    onCategorySelect={handleMainCategorySelect}
                />
            </div>

            <div className="container mx-auto px-4 space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        {/* Interactive Path / Breadcrumbs */}
                        <div className="flex items-center flex-wrap gap-2 text-sm text-[#B44734] font-bold uppercase tracking-wider">
                            <span
                                className={cn(
                                    'cursor-pointer hover:underline transition-colors',
                                    activePath.length === 0
                                        ? 'text-gray-400'
                                        : '',
                                )}
                                onClick={() => router.push('/categories')}>
                                {t('all_products') || 'المنتجات'}
                            </span>
                            {activePath.map((cat, idx) => (
                                <React.Fragment key={cat.id}>
                                    <span className="text-gray-300 mx-1">
                                        /
                                    </span>
                                    <span
                                        className={cn(
                                            'cursor-pointer hover:underline transition-colors',
                                            idx === activePath.length - 1
                                                ? 'text-gray-900'
                                                : '',
                                        )}
                                        onClick={() => handleLevelReset(idx)}>
                                        {cat.name}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            {currentCategory?.name ||
                                t('all_products') ||
                                'كل المنتجات'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <ProductsSorting
                            sortBy={filters.sort}
                            order={filters.order}
                            onSortChange={handleSortChange}
                        />
                    </div>
                </div>

                {/* Subcategories drill-down area */}
                {currentSubCategories.length > 0 && (
                    <SubCategorySelection
                        subCategories={currentSubCategories}
                        activeSubCategoryId="all_sub"
                        onSubCategorySelect={handleSubCategorySelect}
                        currentCategoryLabel={currentCategory?.name}
                        currentCategoryImage={
                            currentCategory?.icon_url ||
                            currentCategory?.image_url
                        }
                    />
                )}

                {/* Vertical Spacing if no subcategories */}
                {currentSubCategories.length === 0 && <div className="h-4" />}

                {/* Products Grid */}
                <div className="min-h-[400px]">
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-3xl border border-red-100 italic">
                            <p>
                                حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة
                                أخرى.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 text-sm underline font-bold">
                                تحديث الصفحة
                            </button>
                        </div>
                    ) : (
                        <ProductsGrid
                            products={productsResult?.data || []}
                            loading={isLoading}
                            pagination={productsResult?.meta}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryContent;
