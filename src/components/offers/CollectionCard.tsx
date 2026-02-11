'use client';

import React from 'react';
import Image from 'next/image';
import { Collection } from '@/types/store';
import SmallTileCard from '@/components/ui/SmallTileCard';

const PLACEHOLDER_IMAGE = '/images/images/mosque.png';

interface CollectionCardProps {
    collection: Collection;
    isSelected: boolean;
    onClick: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
    collection,
    isSelected,
    onClick,
}) => {
    const fallbackComponent = (
        <div className="relative w-full h-full bg-gray-100">
            <Image
                src={PLACEHOLDER_IMAGE}
                alt=""
                fill
                className="object-cover opacity-70"
            />
        </div>
    );

    return (
        <SmallTileCard
            label={collection.name}
            image={collection.image_url || ''}
            isSelected={isSelected}
            onClick={onClick}
            fallbackComponent={fallbackComponent}
            title={collection.name}
            variant="muted"
        />
    );
};

export default CollectionCard;
