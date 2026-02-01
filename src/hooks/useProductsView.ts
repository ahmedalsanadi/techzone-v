// src/hooks/useProductsView.ts
'use client';

import { useEffect } from 'react';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { prefetchNextProductsPage } from '@/lib/products/prefetch';

export function useProductsView() {
    const { filters, isPending, updateFilters } = useUrlFilters({
        defaultPerPage: '8',
    });
    const queryClient = useQueryClient();

    const productsQuery = useQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
        placeholderData: keepPreviousData,
    });

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: () => storeService.getCategories(true),
        staleTime: 1000 * 60 * 60, // 1 hour (server-owned data)
    });

    useEffect(() => {
        void prefetchNextProductsPage({
            queryClient,
            filters,
            pagination: productsQuery.data?.meta,
        });
    }, [queryClient, filters, productsQuery.data?.meta]);

    return {
        filters,
        productsData: productsQuery.data,
        isLoadingProducts: productsQuery.isLoading,
        isFetchingProducts: productsQuery.isFetching,
        categories: categoriesQuery.data || [],
        isLoadingCategories: categoriesQuery.isLoading,
        isPending,
        updateFilters,
    };
}
