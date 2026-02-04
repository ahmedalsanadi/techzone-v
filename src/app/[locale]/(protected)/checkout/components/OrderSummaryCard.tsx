interface SummaryItem {
    label: string;
    value: string;
    isNegative?: boolean;
}

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OrderSummaryCardProps {
    items: SummaryItem[];
    total: string;
    onSubmit?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export default function OrderSummaryCard({
    items,
    total,
    onSubmit,
    isLoading,
    disabled,
}: OrderSummaryCardProps) {
    const t = useTranslations('Checkout');

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-4">
            <h2 className="text-lg sm:text-xl font-bold mb-6">
                {t('summaryTitle') || 'ملخص الطلب'}
            </h2>

            <div className="space-y-4 text-md font-medium">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                        <span
                            className={
                                item.isNegative
                                    ? 'text-green-600 font-bold'
                                    : 'text-gray-600'
                            }>
                            {item.value}
                        </span>
                        <span className="text-gray-700">{item.label}</span>
                    </div>
                ))}

                <div className="border-t pt-4">
                    <div className="flex justify-between">
                        <span className="font-bold text-xl">{total}</span>
                        <span className="font-bold text-lg">
                            {t('total') || 'الاجمالي'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={disabled || isLoading}
                    className="w-full bg-theme-primary hover:brightness-[0.95] text-white font-bold py-3.5 rounded-lg mt-4 shadow-lg shadow-theme-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {t('submitOrder') || 'تقديم الطلب'}
                </button>
            </div>
        </div>
    );
}
