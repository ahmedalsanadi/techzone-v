'use client';

import React from 'react';
import { Collection } from '@/types/store';
import SmallTileCard from '@/components/ui/SmallTileCard';

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

    return (
        <SmallTileCard
            label={collection.name}
            image={collection.image_url || ''}
            isSelected={isSelected}
            onClick={onClick}
            title={collection.name}
            variant="muted"
        />
    );
};

export default CollectionCard;
