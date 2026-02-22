// src/components/pages/categories/CategoryContent.tsx
'use client';

import React, { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { Category } from '@/types/store';
import SubCategorySelection from '@/components/products/SubCategorySelection';
import ProductsGrid from '@/components/products/ProductsGrid';
import CategoryTabs from '@/components/products/CategoryTabs';
import { cn } from '@/lib/utils';
import { useProductConfigFlow } from '@/hooks/products';
import { requiresConfiguration } from '@/lib/products/requirements';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { Button } from '@/components/ui/Button';

interface CategoryContentProps {
    initialCategory?: Category;
}

const PER_PAGE = 15;

function getActivePath(
    nodes: Category[],
    targetSlug: string,
    currentPath: Category[] = [],
): Category[] | null {
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
}

const CategoryContent = ({ initialCategory }: CategoryContentProps) => {
    const t = useTranslations('Category');
    const { categories: allCategories } = useStore();
    const params = useParams();
    const router = useRouter();
    const { loadingProductId, handleAddClick, prefetchProduct } =
        useProductConfigFlow();

    const slug = (params?.slug as string | undefined) ?? undefined;

    const activePath = useMemo(
        () =>
            slug && String(slug).trim()
                ? getActivePath(allCategories, String(slug).trim()) || []
                : [],
        [allCategories, slug],
    );
    const currentCategory =
        activePath[activePath.length - 1] || initialCategory;
    const currentSubCategories = currentCategory?.children || [];

    const baseFilters = useMemo(
        () => ({
            per_page: String(PER_PAGE),
            category_id: currentCategory?.id?.toString(),
        }),
        [currentCategory?.id],
    );

    const {
        data: infiniteData,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ['products', 'infinite', baseFilters],
        queryFn: ({ pageParam, signal }) =>
            storeService.getProducts(
                {
                    ...baseFilters,
                    page: String(pageParam),
                },
                { signal },
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const meta = lastPage?.meta;
            if (!meta || meta.current_page >= meta.last_page) return undefined;
            return meta.current_page + 1;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    const products = useMemo(
        () => infiniteData?.pages.flatMap((p) => p.data ?? []) ?? [],
        [infiniteData],
    );
    const isInternalLoading = isLoading && products.length === 0;

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

            <div className="space-y-8">
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
                        isFetchingNextPage ? 'opacity-60' : 'opacity-100',
                    )}>
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-2xl border border-red-100">
                            <p className="font-medium text-center px-4">
                                {t('productsLoadError')}
                            </p>
                            <Button
                                variant="link"
                                onClick={() => window.location.reload()}
                                className="mt-4 text-sm font-bold p-0 h-auto min-h-0">
                                {t('refreshPage')}
                            </Button>
                        </div>
                    ) : (
                        <ProductsGrid
                            products={products}
                            loading={isInternalLoading}
                            onAddToCart={handleAddClick}
                            getAddToCartLabel={(product) =>
                                requiresConfiguration(product)
                                    ? t('customize') || 'Customize'
                                    : t('addToCart') || 'Add to cart'
                            }
                            isAddingProductId={loadingProductId}
                            onPrefetchProduct={prefetchProduct}
                            hasNextPage={hasNextPage}
                            fetchNextPage={fetchNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryContent;
