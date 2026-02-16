export default function CheckoutPageSkeleton() {
    return (
        <main className="space-y-6 py-2">
            <div className="">
                {/* Breadcrumbs skeleton (checkout hides breadcrumbs on mobile in real UI) */}
                <div className="hidden sm:flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
                </div>

                {/* Title */}
                <div className="mt-8 mb-10 space-y-2">
                    <div className="h-10 w-56 rounded bg-gray-100 animate-pulse" />
                    <div className="h-4 w-72 rounded bg-gray-100 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: order type + payment + coupon */}
                    <div className="lg:col-span-2 space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-4">
                                <div className="h-6 w-48 rounded bg-gray-100 animate-pulse" />
                                <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* Right: summary */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-4">
                            <div className="h-6 w-40 rounded bg-gray-100 animate-pulse" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between gap-3">
                                    <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
                                </div>
                            ))}
                            <div className="h-12 w-full rounded-2xl bg-gray-100 animate-pulse mt-3" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

