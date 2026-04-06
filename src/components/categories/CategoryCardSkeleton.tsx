// src/components/ui/CategoryCardSkeleton.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryCardSkeletonProps {
    className?: string;
    variant?: 'default' | 'circular';
    index?: number;
}

const CategoryCardSkeleton: React.FC<CategoryCardSkeletonProps> = ({
    className,
    variant = 'default',
    index = 0,
}) => {
    // Calculate staggered delay based on index
    const staggerDelay = `${(index % 9) * 100}ms`;
    if (variant === 'circular') {
        return (
            <div
                className={cn(
                    'flex flex-col items-center gap-1.5 w-[72px] sm:w-[80px] md:w-[88px] shrink-0 animate-pulse rounded-xl p-1.5 bg-white/40 ring-2 ring-transparent shadow-sm',
                    className,
                )}
                style={{ animationDelay: staggerDelay }}>
                <div
                    className={cn(
                        'w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex items-center justify-center',
                        'ring-2 ring-gray-200/80 bg-gray-100/50',
                    )}>
                    <div className="w-full h-full bg-gray-100" />
                </div>
                <div className="h-2.5 w-3/4 bg-gray-100/80 rounded" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col w-[80px] sm:w-[92px] md:w-[104px] shrink-0 animate-pulse',
                className,
            )}
            style={{ animationDelay: staggerDelay }}>
            <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                {/* Image Area - compact to match SmallTileCard */}
                <div className="relative w-full aspect-square flex items-center justify-center p-2">
                    <div className="relative w-full h-full min-h-[36px] min-w-[36px] rounded-lg bg-gray-100" />
                </div>
                {/* Label Area */}
                <div className="h-8 px-1.5 pb-1 pt-0.5 flex items-end justify-center">
                    <div className="h-2.5 w-3/4 bg-gray-50 rounded mx-auto" />
                </div>
            </div>
        </div>
    );
};

export default CategoryCardSkeleton;
