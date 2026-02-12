// src/hooks/useOffersView.ts
'use client';

import { useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { Collection } from '@/types/store';
import { useUrlFilters } from '@/hooks/products';

export function useOffersView() {
    const { filters, isPending, updateFilters } = useUrlFilters({
        defaultPerPage: '12',
    });

    const {
        data: collections = [],
        isLoading: isLoadingCollections,
        error: collectionsError,
    } = useQuery({
        queryKey: ['collections'],
        queryFn: () => storeService.getCollections(),
        staleTime: 1000 * 60 * 60, // 1 hour (server-owned data)
    });

    // Stable deduped collections (prevents duplicated UI cards)
    const uniqueCollections = useMemo(() => {
        const seen = new Map<string, Collection>();
        collections.forEach((c) => {
            const key = c.name.toLowerCase();
            if (!seen.has(key)) seen.set(key, c);
        });
        return Array.from(seen.values());
    }, [collections]);

    // Prefer URL selection; fallback to first collection without pushing URL.
    // This avoids an extra client navigation + re-render on first load.
    const selectedCollectionIdFromUrl = useMemo(() => {
        return filters.collection_id ? Number(filters.collection_id) : null;
    }, [filters.collection_id]);

    const activeCollectionId = useMemo(() => {
        return (
            selectedCollectionIdFromUrl ??
            (uniqueCollections.length > 0 ? uniqueCollections[0].id : null)
        );
    }, [selectedCollectionIdFromUrl, uniqueCollections]);

    const effectiveFilters = useMemo(() => {
        // Ensure stable defaults; keep all other URL filters untouched.
        return {
            ...filters,
            page: filters.page || '1',
            per_page: filters.per_page || '12',
            collection_id: activeCollectionId ? String(activeCollectionId) : undefined,
        };
    }, [filters, activeCollectionId]);

    const productsQuery = useQuery({
        queryKey: ['products', effectiveFilters],
        queryFn: () => storeService.getProducts(effectiveFilters),
        enabled: !!activeCollectionId,
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

    return {
        collections: uniqueCollections,
        isLoadingCollections,
        collectionsError,
        selectedCollectionId: activeCollectionId,
        products: productsQuery.data?.data || [],
        pagination: productsQuery.data?.meta,
        isLoadingProducts: productsQuery.isLoading,
        isFetchingProducts: productsQuery.isFetching,
        isPending,
        updateCollectionSelection,
        updatePage,
        currentPage: Number(effectiveFilters.page || '1'),
    };
}
