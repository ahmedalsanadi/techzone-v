import React from 'react';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';

export default function WishlistLoading() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-6 w-16 bg-gray-50 rounded-full animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} index={i} />
                ))}
            </div>
        </div>
    );
}
