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
                    'flex flex-col items-center gap-2.5 w-[80px] sm:w-[88px] md:w-[96px] shrink-0 animate-pulse rounded-2xl p-2 bg-white/40 ring-2 ring-transparent shadow-sm',
                    className,
                )}
                style={{ animationDelay: staggerDelay }}>
                <div
                    className={cn(
                        'w-14 h-14 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden flex items-center justify-center',
                        'ring-2 ring-gray-200/80 bg-gray-100/50',
                    )}>
                    <div className="w-full h-full bg-gray-100" />
                </div>
                <div className="h-3 w-3/4 bg-gray-100/80 rounded" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col w-[88px] sm:w-[100px] md:w-[116px] shrink-0 animate-pulse',
                className,
            )}
            style={{ animationDelay: staggerDelay }}>
            <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                {/* Image Area */}
                <div className="relative w-full aspect-square flex items-center justify-center p-3">
                    <div className="relative w-full h-full min-h-[44px] min-w-[44px] rounded-xl bg-gray-100" />
                </div>
                {/* Label Area */}
                <div className="h-11 px-2 pb-2 pt-1 flex items-end justify-center">
                    <div className="h-3 w-3/4 bg-gray-50 rounded mx-auto" />
                </div>
            </div>
        </div>
    );
};

export default CategoryCardSkeleton;
