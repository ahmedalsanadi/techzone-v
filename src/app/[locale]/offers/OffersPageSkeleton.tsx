// src/app/[locale]/offers/OffersPageSkeleton.tsx
import React from 'react';

export default function OffersPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* Header skeleton */}
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Collections skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-4/3 bg-gray-200 rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>

                {/* Products skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 bg-gray-200 rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
