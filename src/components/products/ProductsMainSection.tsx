// src/components/pages/products/ProductsMainSection.tsx
'use client';

import React from 'react';
import ProductsHeader from './ProductsHeader';
import ProductsGrid from './ProductsGrid';
import { PaginationMeta } from '@/types/api';
import { Product } from '@/types/store';
import { cn } from '@/lib/utils';
import { useProductConfigFlow } from '@/hooks/products';
import { requiresConfiguration } from '@/lib/products/requirements';
import { useTranslations } from 'next-intl';

interface ProductsMainSectionProps {
    products: Product[];
    loading: boolean;
    isFetching: boolean;
    isPending: boolean;
    pagination?: PaginationMeta;
    currentPage: number;
    filters: Record<string, string | undefined>;
    onUpdateFilters: (next: Record<string, string | undefined>) => void;
}

export function ProductsMainSection({
    products,
    loading,
    isFetching,
    isPending,
    pagination,
    currentPage,
    filters,
    onUpdateFilters,
}: ProductsMainSectionProps) {
    const t = useTranslations('Product');
    const { loadingProductId, handleAddClick, prefetchProduct } =
        useProductConfigFlow();

    return (
        <div className="lg:col-span-3 space-y-8 relative z-0 p-1">
            <ProductsHeader
                sortBy={filters.sort}
                order={filters.order}
                onSortChange={(sort, order) =>
                    onUpdateFilters({
                        ...filters,
                        sort,
                        order,
                        page: '1',
                    })
                }
            />

            <div
                className={cn(
                    'transition-opacity duration-200',
                    isPending || isFetching
                        ? 'opacity-50 pointer-events-none'
                        : 'opacity-100',
                )}>
                <ProductsGrid
                    products={products}
                    loading={loading}
                    pagination={pagination}
                    currentPage={currentPage}
                    onPageChange={(p) =>
                        onUpdateFilters({ ...filters, page: String(p) })
                    }
                    onAddToCart={handleAddClick}
                    getAddToCartLabel={(product) =>
                        requiresConfiguration(product)
                            ? t('customize') || 'Customize'
                            : t('addToCart') || 'Add to cart'
                    }
                    isAddingProductId={loadingProductId}
                    onPrefetchProduct={prefetchProduct}
                />
            </div>
        </div>
    );
}
