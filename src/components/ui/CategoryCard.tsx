'use client';

import React from 'react';
import DynamicImage from './DynamicImage';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
    label: string;
    image?: string | null;
    isMain?: boolean;
    isActive?: boolean;
    variant?: 'default' | 'circular';
    onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    label,
    image,
    isMain,
    isActive,
    variant = 'default',
    onClick,
}) => {
    // Shared fallback icon
    const FallbackIcon = (
        <LayoutGrid
            className={cn(
                'w-1/2 h-1/2 opacity-20',
                isActive ? 'text-[#B44734]' : 'text-gray-400',
            )}
        />
    );

    if (variant === 'circular') {
        return (
            <div
                onClick={onClick}
                className="flex flex-col items-center gap-2 cursor-pointer group w-[76px] md:w-[90px] shrink-0">
                <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 p-1.5 transition-all flex items-center justify-center overflow-hidden
                    ${
                        isActive
                            ? 'border-[#B44734] bg-white shadow-md scale-105'
                            : 'border-transparent bg-white/50 group-hover:border-[#B44734]/30'
                    }`}>
                    <DynamicImage
                        src={image || ''}
                        alt={label}
                        fill
                        className="object-cover rounded-full"
                        fallbackComponent={FallbackIcon}
                    />
                </div>
                <span
                    className={`text-[10px] md:text-xs font-bold transition-colors text-center line-clamp-1
                    ${
                        isActive
                            ? 'text-[#B44734]'
                            : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                    {label}
                </span>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center w-[95px] md:w-[125px] group cursor-pointer shrink-0">
            <div
                className={`w-full aspect-4/5 bg-white border rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2 p-2.5 shadow-sm transition-all
                ${
                    isActive
                        ? 'border-[#B44734] shadow-md'
                        : 'border-gray-200/60 group-hover:shadow-md group-hover:border-[#B44734]/20'
                }`}>
                {isMain ? (
                    <div className="flex flex-col items-center gap-2.5 w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <LayoutGrid
                                size={32}
                                className="text-[#B44734]"
                                strokeWidth={1.5}
                            />
                        </div>
                        <span
                            className={`text-[11px] md:text-sm font-bold transition-colors text-center line-clamp-2
                            ${
                                isActive
                                    ? 'text-[#B44734]'
                                    : 'text-gray-800 group-hover:text-[#B44734]'
                            }`}>
                            {label}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="relative w-10 h-10 md:w-14 md:h-14">
                            <DynamicImage
                                src={image || ''}
                                alt={label}
                                fill
                                className="object-contain"
                                fallbackComponent={FallbackIcon}
                            />
                        </div>
                        <span
                            className={`text-[11px] md:text-sm font-bold transition-colors leading-tight text-center line-clamp-2
                            ${
                                isActive
                                    ? 'text-[#B44734]'
                                    : 'text-gray-800 group-hover:text-[#B44734]'
                            }`}>
                            {label}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;
