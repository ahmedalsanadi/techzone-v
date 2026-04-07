'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Loader2 } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Button } from '@/components/ui/Button';
import { formatMoneyAmount } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import CouponSection from './CouponSection';

interface CartSummaryProps {
    subtotal: number;
    disableCheckout: boolean;
    onCheckout: () => void;
}

export function CartSummary({
    subtotal,
    disableCheckout,
    onCheckout,
}: CartSummaryProps) {
    const t = useTranslations('Cart');
    const locale = useLocale();
    const { couponDiscount, syncWithAPI } = useCartStore();

    const finalTotal = Math.max(0, subtotal - couponDiscount);

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
                {t('summary')}
            </h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                        <span>{formatMoneyAmount(subtotal, locale)}</span>
                        <CurrencySymbol className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>{t('delivery')}</span>
                    <span className="text-gray-500 text-sm">
                        {t('deliveryAtCheckout')}
                    </span>
                </div>
                {couponDiscount > 0 && (
                    <div className="flex justify-between text-theme-primary font-medium">
                        <span>{t('couponDiscount')}</span>
                        <div className="flex items-center gap-1">
                            <span>- {formatMoneyAmount(couponDiscount, locale)}</span>
                            <CurrencySymbol className="w-3.5 h-3.5" />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-dashed border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">
                        {t('total')}
                    </span>
                    <div className="flex items-center gap-1.5 text-2xl font-black text-theme-primary">
                        <span>{formatMoneyAmount(finalTotal, locale)}</span>
                        <CurrencySymbol className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <CouponSection onSuccess={() => syncWithAPI()} />
            
            <div className="mb-4"></div>

            <Button
                variant="primary"
                onClick={onCheckout}
                disabled={disableCheckout}
                size="xl"
                className="w-full hover:-translate-y-0.5 active:scale-95">
                {disableCheckout ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <span className="w-full text-center">{t('checkout')}</span>
                        <ArrowRight size={20} className="rtl:rotate-180" />
                    </div>
                )}
            </Button>
        </div>
    );
}
