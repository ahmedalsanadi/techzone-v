// src/components/ui/ProductCardSkeleton.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
    className?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
    className,
}) => {
    return (
        <div
            className={cn(
                'bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col h-full animate-pulse relative',
                className,
            )}>
            {/* Wishlist Button Placeholder */}
            <div className="absolute top-3 left-3 z-5 size-8 rounded-full bg-white/80 border border-gray-100" />

            {/* Image Placeholder */}
            <div className="w-full aspect-square bg-gray-50" />

            {/* Product Info Section */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title Placeholder (2 lines) */}
                <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-100 rounded-md w-full" />
                    <div className="h-4 bg-gray-100 rounded-md w-2/3" />
                </div>

                {/* Price and Badge Section */}
                <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                        {/* Current Price */}
                        <div className="h-5 bg-gray-100 rounded-md w-16" />
                        {/* Old Price (Optional) */}
                        <div className="h-4 bg-gray-50 rounded-md w-10" />
                    </div>
                    {/* Discount Badge */}
                    <div className="h-5 bg-gray-50 rounded-md w-12" />
                </div>
            </div>

            {/* Button Section */}
            <div className="p-4 pt-0">
                <div className="w-full h-10 bg-gray-100 rounded-lg" />
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
