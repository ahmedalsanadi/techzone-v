// src/app/[locale]/my-orders/utils/components/OrderCardSkeleton.tsx

export default function OrderCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5 shadow-sm animate-pulse">
            <div className="flex items-center justify-between gap-4 pt-2 pb-4 border-b border-gray-200">
                <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-12 bg-gray-100 rounded-lg"></div>
                    <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gray-100 rounded-full"></div>
                        <div className="h-4 w-48 bg-gray-100 rounded-md"></div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 mt-auto">
                <div className="flex-1 h-11 bg-gray-100 rounded-xl"></div>
                <div className="flex-1 h-11 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );
}
