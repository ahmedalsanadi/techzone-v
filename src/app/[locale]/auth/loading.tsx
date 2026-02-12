import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-5">
                <div className="h-8 w-40 rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-64 rounded bg-gray-100 animate-pulse" />

                <div className="space-y-3">
                    <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse" />
                    <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse" />
                </div>

                <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse" />

                <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

