import React from 'react';

export default function Loading() {
    return (
        <div className="py-8 md:py-12 px-6">
            <div className="mx-auto">
                {/* Breadcrumbs skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                </div>

                {/* Title skeleton */}
                <div className="mt-8 mb-12 space-y-3">
                    <div className="h-10 w-72 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-96 rounded bg-gray-100 animate-pulse" />
                </div>

                {/* FAQ items skeleton (accordion-like cards) */}
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="h-5 w-3/4 rounded bg-gray-100 animate-pulse" />
                                <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                                <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

