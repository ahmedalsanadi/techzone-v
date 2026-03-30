// src/components/pages/search/SearchContent.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import ProductsGrid from '@/components/products/ProductsGrid';
import ProductsSorting from '@/components/products/ProductsSorting';
import { useTranslations } from 'next-intl';
import { useProductConfigFlow } from '@/hooks/products';
import { requiresConfiguration } from '@/lib/products/requirements';
import { prefetchNextProductsPage } from '@/lib/products/prefetch';

interface SearchContentProps {
    initialQuery?: string;
}

const SearchContent = ({ initialQuery }: SearchContentProps) => {
    const t = useTranslations('Search');
    const { loadingProductId, handleAddClick } = useProductConfigFlow();
    const queryClient = useQueryClient();
    const [sort, setSort] = useState<string | undefined>(undefined);
    const [order, setOrder] = useState<string | undefined>(undefined);
    const [page, setPage] = useState('1');

    const filters = useMemo(
        () => ({
            search: initialQuery,
            sort,
            order,
            page,
        }),
        [initialQuery, sort, order, page],
    );

    const { data: productsResult, isLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
        enabled: !!filters.search, // Only search if there's a query
    });

    useEffect(() => {
        if (!filters.search) return;
        void prefetchNextProductsPage({
            queryClient,
            filters,
            pagination: productsResult?.meta,
        });
    }, [queryClient, filters, productsResult?.meta, filters.search]);

    const handleSortChange = (
        sort: string | undefined,
        order: string | undefined,
    ) => {
        setSort(sort);
        setOrder(order);
        setPage('1');
    };

    const handlePageChange = (page: number) => {
        setPage(page.toString());
    };

    if (!filters.search) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">{t('no_query')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
                <p className="text-gray-500">
                    {productsResult?.meta?.total || 0} {t('items_found')}
                </p>
                <ProductsSorting
                    sortBy={filters.sort}
                    order={filters.order}
                    onSortChange={handleSortChange}
                />
            </div>

            <ProductsGrid
                products={productsResult?.data || []}
                loading={isLoading}
                pagination={productsResult?.meta}
                onPageChange={handlePageChange}
                onAddToCart={handleAddClick}
                getAddToCartLabel={(product) =>
                    requiresConfiguration(product)
                        ? t('customize') || 'Customize'
                        : t('addToCart') || 'Add to cart'
                }
                isAddingProductId={loadingProductId}
            />

            {!isLoading && productsResult?.data.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg">{t('no_results')}</p>
                </div>
            )}
        </div>
    );
};

export default SearchContent;
