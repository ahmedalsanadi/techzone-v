import React from 'react';

export default function Loading() {
    return (
        <div className="space-y-6 py-2">
            {/* Page title skeleton */}
            <div className="flex items-center justify-between gap-3">
                <div className="h-8 w-40 rounded bg-gray-100 animate-pulse" />
                <div className="h-8 w-32 rounded-full bg-gray-100 animate-pulse" />
            </div>

            {/* Filters skeleton */}
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-8 w-20 rounded-full bg-gray-100 animate-pulse"
                    />
                ))}
            </div>

            {/* Notifications list card skeleton */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <li
                            key={index}
                            className="px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3 sm:gap-4"
                        >
                            <div className="mt-2">
                                <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-3 w-12 rounded bg-gray-100 animate-pulse" />
                                </div>
                                <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                                <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-2">
                                <div className="h-5 w-10 rounded-full bg-gray-100 animate-pulse" />
                                <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

