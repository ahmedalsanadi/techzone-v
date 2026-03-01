import React from 'react';

export default function ReportProblemLoading() {
    return (
        <section className="space-y-6 py-2">
            <div className="h-6 w-48 rounded bg-gray-100 animate-pulse" />

            <div className="mt-8 mb-12">
                <div className="h-10 w-64 rounded bg-gray-100 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
                        <div className="mt-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                            <div className="h-5 w-40 rounded bg-gray-100 animate-pulse mb-4" />
                            <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
                        </div>
                    ))}
                    <div className="flex justify-end pt-4">
                        <div className="h-12 w-32 rounded-xl bg-gray-100 animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}
