// src/components/pages/search/SearchContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import ProductsGrid from '@/components/pages/products/ProductsGrid';
import ProductsSorting from '@/components/pages/products/ProductsSorting';
import { useTranslations } from 'next-intl';

interface SearchContentProps {
    initialQuery?: string;
}

const SearchContent = ({ initialQuery }: SearchContentProps) => {
    const t = useTranslations('Search');
    const [filters, setFilters] = useState({
        search: initialQuery,
        sort: undefined as string | undefined,
        order: undefined as string | undefined,
        page: '1',
    });

    // Update search filter if initialQuery changes
    useEffect(() => {
        setFilters((prev) => ({ ...prev, search: initialQuery, page: '1' }));
    }, [initialQuery]);

    const { data: productsResult, isLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
        enabled: !!filters.search, // Only search if there's a query
    });

    const handleSortChange = (
        sort: string | undefined,
        order: string | undefined,
    ) => {
        setFilters((prev) => ({ ...prev, sort, order, page: '1' }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page: page.toString() }));
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
