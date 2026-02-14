'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-4 animate-pulse shadow-sm">
                    <div className="w-full aspect-square bg-gray-100 rounded-2xl" />
                    <div className="w-3/4 h-5 bg-gray-100 rounded-md" />
                    <div className="w-1/2 h-6 bg-gray-100 rounded-md mt-auto" />
                    <div className="w-full h-10 bg-gray-50 rounded-xl" />
                </div>
            ))}
        </div>
    );
}

export function FiltersSidebarSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse space-y-6">
            <div className="h-6 w-1/2 bg-gray-100 rounded" />
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-md" />
                        <div className={cn('h-4 bg-gray-100 rounded', i % 2 ? 'w-2/3' : 'w-1/2')} />
                    </div>
                ))}
            </div>
            <div className="h-6 w-1/3 bg-gray-100 rounded" />
            <div className="h-10 w-full bg-gray-50 rounded-xl" />
        </div>
    );
}

