// src/components/pages/categories/CategoryContent.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { Category } from '@/services/types';
import SubCategorySelection from '@/components/pages/products/SubCategorySelection';
import ProductsGrid from '@/components/pages/products/ProductsGrid';
import ProductsSorting from '@/components/pages/products/ProductsSorting';
import { useTranslations } from 'next-intl';
import CategoryTabs from '@/components/pages/products/CategoryTabs';
import { cn } from '@/lib/utils';

interface CategoryContentProps {
    category?: Category;
    allCategories: Category[];
}

const CategoryContent = ({ category, allCategories }: CategoryContentProps) => {
    const t = useTranslations('Category');
    const [activePath, setActivePath] = useState<Category[]>(() => {
        // Find the full path for the initial category if it's nested
        if (!category) return [];

        // This is a simple case, assuming we start with the provided category
        // In a real app, we might need to find all parents for breadcrumbs
        return [category];
    });

    const [filters, setFilters] = useState({
        sort: undefined as string | undefined,
        order: undefined as string | undefined,
        page: '1',
    });

    // The most specific category currently selected
    const currentCategory = activePath[activePath.length - 1];

    // Subcategories to show: children of the current category
    const currentSubCategories = currentCategory?.children || [];

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

    const handleMainCategorySelect = (id: string) => {
        if (id === 'all') {
            setActivePath([]);
        } else {
            // Find by ID directly since tabs pass ID as string
            const selected = allCategories.find((c) => c.id.toString() === id);
            if (selected) {
                setActivePath([selected]);
            }
        }
        setFilters((prev) => ({ ...prev, page: '1' }));
    };

    const handleSubCategorySelect = (id: string) => {
        if (id === 'all_sub') {
            return;
        }

        const selected = currentSubCategories.find(
            (c) => c.id.toString() === id,
        );
        if (selected) {
            setActivePath((prev) => [...prev, selected]);
            setFilters((prev) => ({ ...prev, page: '1' }));
        }
    };

    // To go back to a parent level
    const handleLevelReset = (levelIndex: number) => {
        setActivePath((prev) => prev.slice(0, levelIndex + 1));
        setFilters((prev) => ({ ...prev, page: '1' }));
    };

    const handleSortChange = (
        sort: string | undefined,
        order: string | undefined,
    ) => {
        setFilters((prev) => ({ ...prev, sort, order, page: '1' }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page: page.toString() }));
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
                                onClick={() => setActivePath([])}>
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
