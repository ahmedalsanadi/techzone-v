// src/app/[locale]/products/ProductsPageSkeleton.tsx
import React from 'react';

export default function ProductsPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters skeleton */}
                <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-32 bg-gray-200 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
                {/* Products skeleton */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 bg-gray-200 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
