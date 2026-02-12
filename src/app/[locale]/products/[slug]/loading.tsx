import React from 'react';

export default function Loading() {
    return (
        <div className="flex flex-col gap-16 pb-24 relative pt-12 px-2 md:px-6">
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
                </div>

                {/* Top Section: Info & Image (matches ProductDetails grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                    {/* Info Column */}
                    <div className="lg:col-span-7 flex flex-col gap-8 order-2">
                        {/* Share actions */}
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                            <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                            <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                        </div>

                        {/* ProductInfo skeleton */}
                        <div className="space-y-4">
                            <div className="h-10 w-3/4 rounded bg-gray-100 animate-pulse" />
                            <div className="h-5 w-1/2 rounded bg-gray-100 animate-pulse" />
                            <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
                            <div className="space-y-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-full rounded bg-gray-100 animate-pulse"
                                    />
                                ))}
                                <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                            </div>
                        </div>

                        {/* Notes skeleton */}
                        <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
                            <div className="h-24 w-full rounded-lg border bg-gray-50 animate-pulse" />
                        </div>

                        {/* ActionBar skeleton */}
                        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-24 rounded bg-gray-100 animate-pulse" />
                                <div className="h-6 w-20 rounded bg-gray-100 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-32 rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="h-12 flex-1 rounded-2xl bg-gray-100 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Gallery Column */}
                    <div className="lg:col-span-5 order-1">
                        <div className="sticky top-24">
                            <div className="w-full aspect-square rounded-3xl bg-gray-100 animate-pulse" />
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-2xl bg-gray-100 animate-pulse"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
                        <div className="h-5 w-32 rounded bg-gray-100 animate-pulse" />
                        {Array.from({ length: 4 }).map((__, j) => (
                            <div
                                key={j}
                                className="h-10 w-full rounded-2xl bg-gray-100 animate-pulse"
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Reviews skeleton */}
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
                <div className="h-6 w-40 rounded bg-gray-100 animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                            <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                            <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

