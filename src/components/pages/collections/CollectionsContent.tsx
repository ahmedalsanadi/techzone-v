// src/components/pages/collections/CollectionsContent.tsx
'use client';

import React, { useMemo, useTransition, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import ProductsGrid from '../products/ProductsGrid';
import CollectionCard from './CollectionCard';
import { Collection } from '@/services/types';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface CollectionsContentProps {
    initialCollectionId?: string;
}

const CollectionsContent: React.FC<CollectionsContentProps> = ({
    initialCollectionId,
}) => {
    const t = useTranslations('Collections');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Get selected collection ID from URL
    const selectedCollectionId = useMemo(() => {
        const collectionId = searchParams.get('collection_id');
        return collectionId
            ? Number(collectionId)
            : initialCollectionId
            ? Number(initialCollectionId)
            : null;
    }, [searchParams, initialCollectionId]);

    // Fetch collections
    const {
        data: collections = [],
        isLoading: isLoadingCollections,
        error: collectionsError,
    } = useQuery({
        queryKey: ['collections'],
        queryFn: () => storeService.getCollections(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Derive filters from URL searchParams for products
    const productFilters = useMemo(() => {
        const queryParams: Record<string, string | undefined> = {};
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        // Ensure per_page is always set
        if (!queryParams.per_page) queryParams.per_page = '12';
        // Add collection_id if selected
        if (selectedCollectionId) {
            queryParams.collection_id = selectedCollectionId.toString();
        }
        return queryParams;
    }, [searchParams, selectedCollectionId]);

    // Fetch products for selected collection
    const {
        data: productsResult,
        isLoading: isLoadingProducts,
        isFetching: isFetchingProducts,
    } = useQuery({
        queryKey: ['products', productFilters],
        queryFn: () => storeService.getProducts(productFilters),
        enabled: !!selectedCollectionId, // Only fetch if collection is selected
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const updateCollectionSelection = useCallback(
        (collectionId: number) => {
            const params = new URLSearchParams();
            params.set('collection_id', collectionId.toString());
            params.set('page', '1'); // Reset to first page
            params.set('per_page', '12');

            const queryString = params.toString();
            const url = `${pathname}?${queryString}`;

            startTransition(() => {
                router.replace(url, { scroll: false });
            });
        },
        [pathname, router],
    );

    // Auto-select first collection if none selected and collections are loaded
    useEffect(() => {
        if (
            !selectedCollectionId &&
            collections.length > 0 &&
            !isLoadingCollections
        ) {
            const firstCollection = collections[0];
            if (firstCollection) {
                updateCollectionSelection(firstCollection.id);
            }
        }
    }, [
        collections,
        selectedCollectionId,
        isLoadingCollections,
        updateCollectionSelection,
    ]);

    const updatePage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        const queryString = params.toString();
        const url = `${pathname}?${queryString}`;

        startTransition(() => {
            router.replace(url, { scroll: false });
        });
    };

    // Deduplicate collections by name (in case API returns duplicates)
    const uniqueCollections = useMemo(() => {
        const seen = new Map<string, Collection>();
        collections.forEach((collection) => {
            const key = collection.name.toLowerCase();
            if (!seen.has(key)) {
                seen.set(key, collection);
            }
        });
        return Array.from(seen.values());
    }, [collections]);

    // Get selected collection for title update
    const selectedCollection = useMemo(() => {
        if (!selectedCollectionId) return null;
        return uniqueCollections.find((c) => c.id === selectedCollectionId);
    }, [selectedCollectionId, uniqueCollections]);

    // Update document title on client side to prevent flicker
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const baseTitle = t('title');
        const title = selectedCollection
            ? `${baseTitle} - ${selectedCollection.name}`
            : baseTitle;
        const fullTitle = `${title} | ${siteConfig.name}`;

        // Update title immediately to prevent flicker
        document.title = fullTitle;

        // Cleanup: restore default on unmount (optional)
        return () => {
            // Don't restore on unmount - let Next.js handle it
        };
    }, [selectedCollection, t]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Collections Error State */}
                {collectionsError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">
                            {t('errorLoadingCollections')}
                        </p>
                    </div>
                )}

                {/* Collections Grid */}
                {!collectionsError && (
                    <div>
                        {isLoadingCollections ? (
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-[85px] md:w-[110px] aspect-4/5 md:aspect-square bg-gray-100 rounded-2xl animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : uniqueCollections.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                <p className="text-gray-500">
                                    {t('noCollections')}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                {uniqueCollections.map((collection) => (
                                    <CollectionCard
                                        key={collection.id}
                                        collection={collection}
                                        isSelected={
                                            selectedCollectionId ===
                                            collection.id
                                        }
                                        onClick={() =>
                                            updateCollectionSelection(
                                                collection.id,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Products Section */}
                {selectedCollectionId && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('productsInCollection')}
                            </h2>
                        </div>

                        <div
                            className={cn(
                                'transition-opacity duration-200 min-h-[600px]',
                                isFetchingProducts || isPending
                                    ? 'opacity-50 pointer-events-none'
                                    : 'opacity-100',
                            )}>
                            <ProductsGrid
                                products={productsResult?.data || []}
                                loading={isLoadingProducts}
                                currentPage={Number(productFilters.page || '1')}
                                pagination={productsResult?.meta}
                                variant="compact"
                                onPageChange={updatePage}
                            />
                        </div>
                    </div>
                )}

                {/* No Collection Selected State */}
                {!selectedCollectionId &&
                    !isLoadingCollections &&
                    uniqueCollections.length > 0 && (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-500 text-lg">
                                {t('selectCollectionToViewProducts')}
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default CollectionsContent;
