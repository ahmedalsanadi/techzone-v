// src/components/ui/ProductCardSkeleton.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
    className?: string;
    index?: number;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
    className,
    index = 0,
}) => {
    // Calculate staggered delay based on index (cycles every 8 items)
    const staggerDelay = `${(index % 8) * 150}ms`;

    return (
        <div
            className={cn(
                'bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col h-full animate-pulse relative',
                className,
            )}
            style={{ animationDelay: staggerDelay }}>
            {/* Wishlist Button Placeholder */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-5 size-7 sm:size-8 rounded-full bg-theme-primary/5 border border-theme-primary/10" />

            {/* Image Placeholder */}
            <div className="w-full aspect-square bg-theme-primary/5" />

            {/* Product Info Section */}
            <div className="p-2 sm:p-4 flex flex-col flex-1">
                {/* Title Placeholder (2 lines) */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="h-3.5 sm:h-4 bg-gray-100 rounded-md w-full" />
                    <div className="h-3.5 sm:h-4 bg-gray-100 rounded-md w-2/3" />
                </div>

                {/* Price and Badge Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-auto">
                    <div className="flex items-center gap-2">
                        {/* Current Price */}
                        <div className="h-4.5 sm:h-5 bg-gray-100 rounded-md w-14 sm:w-16" />
                        {/* Old Price (Optional) */}
                        <div className="h-3.5 sm:h-4 bg-gray-50 rounded-md w-8 sm:w-10" />
                    </div>
                    {/* Discount Badge */}
                    <div className="h-4 sm:h-5 bg-gray-50 rounded-md w-10 sm:w-12" />
                </div>
            </div>

            {/* Button Section */}
            <div className="p-2 sm:p-4 pt-0">
                <div className="w-full h-9 sm:h-11 bg-gray-100 rounded-lg" />
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
