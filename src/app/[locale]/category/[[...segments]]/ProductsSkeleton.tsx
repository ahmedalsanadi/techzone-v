// src/app/[locale]/category/[[...segments]]/ProductsSkeleton.tsx
'use client';

import React from 'react';
import { MIN_HEIGHTS } from './constants';

/**
 * Loading skeleton for products grid.
 * Maintains consistent height to prevent layout shift.
 */
export default function ProductsSkeleton() {
    return (
        <section
            className="space-y-8 pt-8 border-t border-gray-100"
            style={{ minHeight: `${MIN_HEIGHTS.PRODUCTS_GRID}px` }}>
            <div className="flex items-center justify-between">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse flex flex-col h-full"
                        style={{ animationDelay: `${i * 50}ms` }}>
                        {/* Image skeleton */}
                        <div className="aspect-square bg-theme-primary/5" />
                        {/* Content skeleton */}
                        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                            <div className="h-4 sm:h-5 w-3/4 bg-gray-100 rounded" />
                            <div className="h-3 sm:h-4 w-1/2 bg-gray-100 rounded" />
                            <div className="h-9 sm:h-11 w-full bg-gray-100 rounded-lg mt-auto" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
