import React from 'react';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Title skeleton */}
            <div className="flex items-center gap-3 mb-10">
                <div className="h-10 w-56 rounded bg-gray-100 animate-pulse" />
                <div className="h-7 w-24 rounded-full bg-gray-100 animate-pulse" />
            </div>

            {/* Grid skeleton (matches Wishlist cards layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                        {/* Image */}
                        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                            <div className="absolute top-3 right-3 h-6 w-14 rounded-lg bg-gray-200/80 animate-pulse" />
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <div className="space-y-3 mb-3">
                                <div className="h-6 w-4/5 rounded bg-gray-100 animate-pulse" />
                                <div className="h-5 w-2/5 rounded bg-gray-100 animate-pulse" />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-auto">
                                <div className="h-11 flex-1 rounded-xl bg-gray-100 animate-pulse" />
                                <div className="h-11 w-11 rounded-xl bg-gray-100 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
