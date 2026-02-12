import React from 'react';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="h-10 w-56 bg-gray-100 rounded-xl animate-pulse mb-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-3/5 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="h-4 w-2/5 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="h-4 w-1/3 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                            <div className="w-28 h-10 bg-gray-100 rounded-lg animate-pulse shrink-0" />
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-4">
                        <div className="h-6 w-32 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-12 w-full bg-gray-100 rounded-2xl animate-pulse mt-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

