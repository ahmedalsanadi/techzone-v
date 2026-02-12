import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Global fallback skeleton (no fake navbar) */}
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <div className="h-8 w-64 rounded bg-gray-100 animate-pulse" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                <div className="h-44 bg-gray-100 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 w-4/5 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-4 w-2/5 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
