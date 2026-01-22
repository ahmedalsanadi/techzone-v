// src/components/checkout/OrderSummaryCard.tsx
interface SummaryItem {
    label: string;
    value: string;
}

interface OrderSummaryCardProps {
    items: SummaryItem[];
    total: string;
}

export default function OrderSummaryCard({
    items,
    total,
}: OrderSummaryCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-4">
            <h2 className="text-lg sm:text-xl font-bold mb-6">ملخص الطلب</h2>

            <div className="space-y-4 text-md font-medium">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{item.value}</span>
                        <span className="text-gray-700">{item.label}</span>
                    </div>
                ))}

                <div className="border-t pt-4">
                    <div className="flex justify-between">
                        <span className="font-bold text-xl">{total}</span>
                        <span className="font-bold text-lg">الاجمالي</span>
                    </div>
                </div>

                <button className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 rounded-lg mt-4">
                    تقديم الطلب
                </button>
            </div>
        </div>
    );
}
