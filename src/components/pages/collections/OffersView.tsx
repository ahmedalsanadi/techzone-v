// src/components/pages/collections/OffersView.tsx
'use client';

import React from 'react';
import { useOffersView } from '@/hooks/useOffersView';
import { CollectionsStrip } from './CollectionsStrip';
import { OffersProductsSection } from './OffersProductsSection';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function OffersView() {
    const t = useTranslations('Collections');
    const {
        collections,
        isLoadingCollections,
        collectionsError,
        selectedCollectionId,
        products,
        pagination,
        isLoadingProducts,
        isFetchingProducts,
        isPending,
        updateCollectionSelection,
        updatePage,
        currentPage,
    } = useOffersView();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {collectionsError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">
                            {t('errorLoadingCollections')}
                        </p>
                    </div>
                )}

                <CollectionsStrip
                    collections={collections}
                    selectedCollectionId={selectedCollectionId}
                    isLoading={isLoadingCollections}
                    onSelect={updateCollectionSelection}
                />

                {selectedCollectionId && (
                    <OffersProductsSection
                        products={products}
                        loading={isLoadingProducts}
                        isFetching={isFetchingProducts}
                        isPending={isPending}
                        currentPage={currentPage}
                        pagination={pagination}
                        onPageChange={updatePage}
                    />
                )}
            </div>
        </div>
    );
}
