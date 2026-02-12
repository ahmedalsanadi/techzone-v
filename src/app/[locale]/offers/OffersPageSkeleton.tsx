// src/app/[locale]/offers/OffersPageSkeleton.tsx
import React from 'react';

export default function OffersPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Collections strip skeleton (matches CollectionsStrip) */}
                <div className="flex flex-wrap items-stretch gap-2 md:gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-[85px] md:w-[110px] aspect-4/5 md:aspect-square bg-gray-100 rounded-2xl animate-pulse"
                        />
                    ))}
                </div>

                {/* Products section skeleton (matches OffersProductsSection + ProductsGrid) */}
                <div className="space-y-6">
                    <div className="h-7 w-60 rounded bg-gray-100 animate-pulse" />
                    <div className="min-h-[600px] transition-opacity duration-200">
                        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center gap-4 animate-pulse shadow-sm">
                                    <div className="w-full aspect-square bg-gray-100 rounded-2xl" />
                                    <div className="w-3/4 h-5 bg-gray-100 rounded-md" />
                                    <div className="w-1/2 h-6 bg-gray-100 rounded-md mt-auto" />
                                    <div className="w-full h-10 bg-gray-50 rounded-xl" />
                                </div>
                            ))}
                        </div>

                        {/* Pagination skeleton */}
                        <div className="pt-10 flex items-center justify-center">
                            <div className="h-10 w-64 rounded-xl bg-gray-100 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
