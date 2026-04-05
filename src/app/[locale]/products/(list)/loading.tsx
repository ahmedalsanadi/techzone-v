import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    FilterSidebarSkeleton,
    ResultsHeaderSkeleton,
    AppliedFiltersSkeleton,
    ProductsGridSkeleton,
    PaginationSkeleton,
} from '@/components/products/listing/ProductsSkeleton';

export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50/30 space-y-6 py-4">
            {/* breadcrumbs */}
            <div className="flex items-center gap-2 mb-8">
                <Skeleton className="h-4 w-16 rounded" />
                <div className="h-1 w-1 rounded-full bg-gray-300" />
                <Skeleton className="h-4 w-20 rounded" />
            </div>

            {/* products grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters column */}
                <div className="lg:sticky lg:top-24 lg:self-start lg:z-10">
                    <FilterSidebarSkeleton />
                </div>

                {/* Results column */}
                <div className="lg:col-span-3 space-y-6">
                    <ResultsHeaderSkeleton />
                    <AppliedFiltersSkeleton />
                    <ProductsGridSkeleton count={8} />
                </div>
            </div>

            {/* Pagination skeleton */}
            <div className="mt-6 sm:mt-12">
                <PaginationSkeleton />
            </div>
        </main>
    );
}
