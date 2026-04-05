
export default function Loading() {
    return (
        <section className="min-h-screen pb-16 pt-6 px-2 md:px-4">
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="h-8 w-56 rounded bg-gray-100 animate-pulse" />
                <div className="h-10 w-28 rounded-xl bg-gray-100 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: timeline + summary blocks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="h-6 w-40 rounded bg-gray-100 animate-pulse" />
                        <div className="mt-6 space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                                    <div className="h-4 w-48 rounded bg-gray-100 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="h-6 w-48 rounded bg-gray-100 animate-pulse" />
                        <div className="mt-6 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between gap-3">
                                    <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: actions / courier / map placeholder */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
                        <div className="mt-6 space-y-3">
                            <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse" />
                            <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse" />
                        </div>
                    </div>
                    <div className="w-full h-80 bg-gray-100 animate-pulse rounded-3xl" />
                </div>
            </div>
        </section>
    );
}

