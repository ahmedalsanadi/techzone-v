// src/components/pages/collections/CollectionCard.tsx
'use client';

import React from 'react';
import { Collection } from '@/services/types';
import DynamicImage from '@/components/ui/DynamicImage';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CollectionCardProps {
    collection: Collection;
    isSelected: boolean;
    onClick: () => void;
}

const PLACEHOLDER_IMAGE = '/images/images/mosque.png';

const CollectionCard: React.FC<CollectionCardProps> = ({
    collection,
    isSelected,
    onClick,
}) => {
    // Fallback component using mosque placeholder
    const FallbackIcon = (
        <div className="relative w-full h-full">
            <Image
                src={PLACEHOLDER_IMAGE}
                alt={collection.name}
                fill
                className="object-contain opacity-60"
            />
        </div>
    );

    return (
        <div
            onClick={onClick}
            className="group outline-none flex flex-col items-center w-[85px] md:w-[110px] shrink-0 cursor-pointer">
            <div
                className={cn(
                    'w-full aspect-4/5 md:aspect-square flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 rounded-2xl relative',
                    isSelected
                        ? 'bg-white border-2 border-[#B44734] shadow-xl -translate-y-1'
                        : 'bg-gray-100 border border-gray-200 group-hover:bg-gray-50 group-hover:border-[#B44734]/30 group-hover:shadow-md',
                )}>
                {/* Image/Icon */}
                <div className="relative w-10 h-10 md:w-14 md:h-14 transition-transform group-hover:scale-110">
                    <DynamicImage
                        src={collection.image_url || ''}
                        alt={collection.name}
                        fill
                        className="object-contain"
                        fallbackComponent={FallbackIcon}
                    />
                </div>

                {/* Text */}
                <span
                    className={cn(
                        'text-[11px] md:text-xs font-bold transition-colors leading-tight text-center line-clamp-1 px-1 truncate w-full',
                        isSelected
                            ? 'text-[#B44734]'
                            : 'text-gray-900 group-hover:text-[#B44734]',
                    )}
                    title={collection.name}>
                    {collection.name}
                </span>

                {/* Active Indicator Line */}
                {isSelected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-[#B44734] rounded-full" />
                )}
            </div>
        </div>
    );
};

export default CollectionCard;
