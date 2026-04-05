'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-2xl p-2 sm:p-4 flex flex-col items-center gap-2 sm:gap-4 shadow-sm">
                    <Skeleton className="w-full aspect-square rounded-xl sm:rounded-2xl" />
                    <div className="w-full space-y-1.5 sm:space-y-2">
                        <Skeleton className="w-3/4 h-3.5 sm:h-5 rounded-md" />
                        <Skeleton className="w-1/2 h-3 sm:h-4 rounded-md opacity-50" />
                    </div>
                    <div className="w-full mt-auto space-y-2 sm:space-y-3">
                        <Skeleton className="w-1/3 h-5 sm:h-7 rounded-lg" />
                        <Skeleton className="w-full h-8 sm:h-11 rounded-lg sm:rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FilterSidebarSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-24 rounded-lg" />
                <Skeleton className="h-4 w-16 rounded-md" />
            </div>

            {/* Search */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <Skeleton className="h-4 w-28 rounded" />
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="size-5 rounded-md" />
                                <Skeleton className="h-4 w-32 rounded" />
                            </div>
                            <Skeleton className="h-3 w-6 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-11 rounded-xl" />
                    <Skeleton className="h-11 rounded-xl" />
                </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
                <Skeleton className="h-4 w-32 rounded" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="size-5 rounded-md" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ResultsHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between pb-4">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
    );
}

export function AppliedFiltersSkeleton() {
    return (
        <div className="flex flex-wrap items-center gap-2 py-2">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function PaginationSkeleton() {
    return (
        <div className="flex items-center justify-center gap-2 pt-4 sm:pt-8 border-t border-gray-100">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="size-10 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
    );
}
