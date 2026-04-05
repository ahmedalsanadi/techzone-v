// src/app/[locale]/products/ProductsPageSkeleton.tsx
import React from 'react';

export default function ProductsPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters sidebar skeleton */}
                <div className="lg:sticky lg:top-24 lg:self-start lg:z-10">
                    <div className="space-y-6">
                        {/* Sidebar header */}
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <div className="w-5 h-5 rounded bg-primary/20 animate-pulse" />
                            </div>
                            <div className="h-6 w-24 rounded bg-gray-100 animate-pulse" />
                        </div>

                        {/* Categories card */}
                        <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
                                <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
                            </div>
                            <div className="h-64 pr-4 -mr-4 overflow-hidden">
                                <div className="space-y-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded bg-gray-100 animate-pulse" />
                                            <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Price range card */}
                        <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
                                <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                            </div>
                            <div className="px-1">
                                <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                                <div className="flex items-center justify-between mt-4">
                                    <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
                                    <div className="w-4 h-px bg-gray-200" />
                                    <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Quick filters card */}
                        <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
                                <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-gray-100 animate-pulse" />
                                        <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reset button */}
                        <div className="h-12 w-full rounded-3xl bg-gray-100 animate-pulse" />
                    </div>
                </div>

                {/* Products skeleton (matches ProductsHeader + ProductsGrid skeleton) */}
                <div className="lg:col-span-3 space-y-6 relative z-0">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <div className="h-7 w-40 rounded bg-gray-100 animate-pulse" />
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:block h-4 w-14 rounded bg-gray-100 animate-pulse" />
                            <div className="h-10 w-[180px] rounded-md bg-white border border-gray-200 animate-pulse" />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-2 sm:p-4 flex flex-col items-center gap-2 sm:gap-4 animate-pulse shadow-sm">
                                <div className="w-full aspect-square bg-gray-100 rounded-lg sm:rounded-2xl" />
                                <div className="w-3/4 h-4 sm:h-5 bg-gray-100 rounded-md" />
                                <div className="w-1/2 h-5 sm:h-6 bg-gray-100 rounded-md mt-auto" />
                                <div className="w-full h-9 sm:h-10 bg-gray-50 rounded-lg sm:rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
