interface SummaryItem {
    label: string;
    value: string;
    amount?: number;
    isNegative?: boolean;
}

import { Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { cn, formatMoneyAmount } from '@/lib/utils';
import CurrencySymbol from '../ui/CurrencySymbol';
import React from 'react';

interface OrderSummaryCardProps {
    items: SummaryItem[];
    total: React.ReactNode;
    onSubmit?: () => void;
    isLoading?: boolean;
    isRefreshing?: boolean;
    disabled?: boolean;
    /** Optional reason shown when submit is disabled (e.g. "Select address to continue") */
    disabledReason?: string;
}

export default function OrderSummaryCard({
    items,
    total,
    onSubmit,
    isLoading,
    isRefreshing,
    disabled,
    disabledReason,
}: OrderSummaryCardProps) {
    const t = useTranslations('Checkout');
    const locale = useLocale();

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm ">
            <h2 className="text-base font-bold text-gray-800 mb-4">
                {t('summaryTitle') || 'ملخص الطلب'}
            </h2>

            <div
                className={cn(
                    'space-y-3 text-sm font-bold transition-opacity duration-200',
                    isRefreshing && 'opacity-50 pointer-events-none',
                )}>
                {items.map((item, index) => (
                    <div
                        key={`${item.label}-${index}`}
                        className="flex justify-between">
                        <span className="text-gray-700">{item.label}</span>
                        <div
                            className={cn(
                                'flex items-center gap-1 font-bold',
                                item.isNegative
                                    ? 'text-green-600'
                                    : 'text-gray-900',
                            )}>
                            {item.amount != null ? (
                                <>
                                    <span>
                                        {item.isNegative ? '- ' : ''}
                                        {formatMoneyAmount(item.amount, locale)}
                                    </span>
                                    <CurrencySymbol className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <span>{item.value}</span>
                            )}
                        </div>
                    </div>
                ))}

                <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex justify-between">
                        <span className="font-bold text-base">
                            {t('total') || 'الاجمالي'}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-lg text-theme-primary">
                            {typeof total === 'number' ? (
                                <>
                                    <span>
                                        {formatMoneyAmount(total, locale)}
                                    </span>
                                    <CurrencySymbol className="w-5 h-5 ml-0.5" />
                                </>
                            ) : (
                                <span>{total}</span>
                            )}
                        </div>
                    </div>
                </div>

                {disabled && disabledReason && (
                    <p className="text-amber-700 text-xs mt-2">
                        {disabledReason}
                    </p>
                )}
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onSubmit}
                    disabled={disabled || isLoading}
                    className="w-full mt-4 rounded-lg">
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {t('submitOrder') || 'تقديم الطلب'}
                </Button>
            </div>
        </div>
    );
}
