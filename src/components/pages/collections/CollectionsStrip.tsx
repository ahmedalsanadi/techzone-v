// src/components/pages/collections/CollectionsStrip.tsx
'use client';

import React from 'react';
import CollectionCard from './CollectionCard';
import { Collection } from '@/services/types';

interface CollectionsStripProps {
    collections: Collection[];
    selectedCollectionId: number | null;
    isLoading: boolean;
    onSelect: (id: number) => void;
}

export function CollectionsStrip({
    collections,
    selectedCollectionId,
    isLoading,
    onSelect,
}: CollectionsStripProps) {
    if (isLoading) {
        return (
            <div className="flex flex-wrap items-stretch gap-2 md:gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-[85px] md:w-[110px] aspect-4/5 md:aspect-square bg-gray-100 rounded-2xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-stretch gap-2 md:gap-3">
            {collections.map((collection) => (
                <CollectionCard
                    key={collection.id}
                    collection={collection}
                    isSelected={selectedCollectionId === collection.id}
                    onClick={() => onSelect(collection.id)}
                />
            ))}
        </div>
    );
}
