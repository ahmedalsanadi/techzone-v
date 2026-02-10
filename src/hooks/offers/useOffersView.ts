// src/hooks/useOffersView.ts
'use client';

import { useMemo, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { Collection } from '@/types/store';
import { useUrlFilters } from '@/hooks/products';

export function useOffersView() {
    const { filters, isPending, updateFilters, searchParams } = useUrlFilters({
        defaultPerPage: '12',
    });

    const selectedCollectionId = useMemo(() => {
        return filters.collection_id ? Number(filters.collection_id) : null;
    }, [filters.collection_id]);

    const {
        data: collections = [],
        isLoading: isLoadingCollections,
        error: collectionsError,
    } = useQuery({
        queryKey: ['collections'],
        queryFn: () => storeService.getCollections(),
        staleTime: 1000 * 60 * 60, // 1 hour (server-owned data)
    });

    const productsQuery = useQuery({
        queryKey: ['products', filters],
        queryFn: () => storeService.getProducts(filters),
        enabled: !!selectedCollectionId,
        placeholderData: keepPreviousData,
    });

    const updateCollectionSelection = useCallback(
        (collectionId: number) => {
            updateFilters({
                collection_id: collectionId.toString(),
                page: '1',
                per_page: '12',
            });
        },
        [updateFilters],
    );

    const updatePage = useCallback(
        (page: number) => {
            updateFilters({ page: page.toString() });
        },
        [updateFilters],
    );

    // Auto-select first collection logic (UX Decision)
    useEffect(() => {
        if (
            !selectedCollectionId &&
            collections.length > 0 &&
            !isLoadingCollections
        ) {
            updateCollectionSelection(collections[0].id);
        }
    }, [
        collections,
        selectedCollectionId,
        isLoadingCollections,
        updateCollectionSelection,
    ]);

    const uniqueCollections = useMemo(() => {
        const seen = new Map<string, Collection>();
        collections.forEach((c) => {
            const key = c.name.toLowerCase();
            if (!seen.has(key)) seen.set(key, c);
        });
        return Array.from(seen.values());
    }, [collections]);

    return {
        collections: uniqueCollections,
        isLoadingCollections,
        collectionsError,
        selectedCollectionId,
        products: productsQuery.data?.data || [],
        pagination: productsQuery.data?.meta,
        isLoadingProducts: productsQuery.isLoading,
        isFetchingProducts: productsQuery.isFetching,
        isPending,
        updateCollectionSelection,
        updatePage,
        currentPage: Number(filters.page || '1'),
    };
}
