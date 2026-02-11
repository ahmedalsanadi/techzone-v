// src/components/pages/categories/CategoryContent.tsx
'use client';

import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { Category } from '@/types/store';
import SubCategorySelection from '@/components/products/SubCategorySelection';
import ProductsGrid from '@/components/products/ProductsGrid';
// import { useTranslations } from 'next-intl';
import CategoryTabs from '@/components/products/CategoryTabs';
import { cn } from '@/lib/utils';
import { useProductConfigFlow } from '@/hooks/products';
import { requiresConfiguration } from '@/lib/products/requirements';
import { useTranslations } from 'next-intl';
import { prefetchNextProductsPage } from '@/lib/products/prefetch';

import { useParams, useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { Button } from '@/components/ui/Button';

interface CategoryContentProps {
    initialCategory?: Category;
}

const CategoryContent = ({ initialCategory }: CategoryContentProps) => {
    const t = useTranslations('Category');
    const { categories: allCategories } = useStore();
    const queryClient = useQueryClient();
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { loadingProductId, handleAddClick, prefetchProduct } =
        useProductConfigFlow();

    const slug = params.slug as string;
    const page = searchParams.get('page') || '1';

    const getActivePath = (
        nodes: Category[],
        targetSlug: string,
        currentPath: Category[] = [],
    ): Category[] | null => {
        for (const node of nodes) {
            if (
                node.slug === targetSlug ||
                node.id?.toString() === targetSlug
            ) {
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
        page,
        per_page: '8',
    };

    const {
        data: productsResult,
        isLoading,
        // isPlaceholderData,
        isFetching,
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
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    useEffect(() => {
        if (!currentCategory?.id) return;
        void prefetchNextProductsPage({
            queryClient,
            filters: {
                ...filters,
                category_id: currentCategory?.id.toString(),
            },
            pagination: productsResult?.meta,
        });
    }, [queryClient, filters, currentCategory?.id, productsResult?.meta]);

    const isInternalLoading = isLoading && !productsResult;

    const updateUrl = (newPath: string, newParams?: Record<string, string>) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        if (newParams) {
            Object.entries(newParams).forEach(([k, v]) => {
                if (v) currentParams.set(k, v);
                else currentParams.delete(k);
            });
        }

        const queryString = currentParams.toString();
        const url = `${newPath}${queryString ? `?${queryString}` : ''}`;

        router.push(url, {
            scroll: false,
        });
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

    // const handleLevelReset = (levelIndex: number) => {
    //     const target = activePath[levelIndex];
    //     if (target) {
    //         router.push(`/categories/${target.slug || target.id}`);
    //     }
    // };

    const handlePageChange = (page: number) => {
        updateUrl(pathname, { page: page.toString() });
    };

    return (
        <div className="space-y-6">
            {/* Top Level Category Tabs */}
            <div className="bg-transparent -mx-4 px-4 py-4 border-b border-gray-100 mb-8 overflow-hidden">
                <CategoryTabs
                    categories={allCategories}
                    activeCategoryId={activePath[0]?.id?.toString() || 'all'}
                    onCategorySelect={handleMainCategorySelect}
                />
            </div>

            <div className="container mx-auto px-4 space-y-8 pb-20">
                {/* Header Section */}
                {/* <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            {currentCategory?.name ||
                                t('all_products') ||
                                'كل المنتجات'}
                        </h1>
                    </div>
                </div> */}

                {/* Recursive Subcategories drill-down area */}
                {activePath.map((cat: Category, index: number) => {
                    const subCats = cat.children || [];
                    if (subCats.length === 0) return null;

                    // The 'active' subcategory for this specific row is the next item in the path
                    const nextInPath = activePath[index + 1];
                    const activeSubId = nextInPath?.id?.toString() || 'all_sub';

                    return (
                        <div
                            key={cat.id}
                            className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <SubCategorySelection
                                subCategories={subCats}
                                activeSubCategoryId={activeSubId}
                                parentHref={`/categories/${cat.slug || cat.id}`}
                                currentCategoryLabel={cat.name}
                                currentCategoryImage={
                                    cat.icon_url || cat.image_url
                                }
                            />
                        </div>
                    );
                })}

                {/* Vertical Spacing if no subcategories */}
                {currentSubCategories.length === 0 && <div className="h-4" />}

                {/* Products Grid */}
                <div
                    className={cn(
                        'min-h-[600px] flex flex-col transition-opacity duration-300',
                        isFetching && !isInternalLoading
                            ? 'opacity-60'
                            : 'opacity-100',
                    )}>
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-3xl border border-red-100 italic">
                            <p>
                                حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة
                                أخرى.
                            </p>
                            <Button
                                variant="link"
                                onClick={() => window.location.reload()}
                                className="mt-4 text-sm underline font-bold p-0 h-auto min-h-0">
                                تحديث الصفحة
                            </Button>
                        </div>
                    ) : (
                        <ProductsGrid
                            products={productsResult?.data || []}
                            loading={isInternalLoading}
                            currentPage={Number(page)}
                            pagination={productsResult?.meta}
                            onPageChange={handlePageChange}
                            onAddToCart={handleAddClick}
                            getAddToCartLabel={(product) =>
                                requiresConfiguration(product)
                                    ? t('customize') || 'Customize'
                                    : t('addToCart') || 'Add to cart'
                            }
                            isAddingProductId={loadingProductId}
                            onPrefetchProduct={prefetchProduct}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryContent;
