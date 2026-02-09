'use client';

import { CreditCard, Banknote, Wallet, Check } from 'lucide-react';
import CheckoutCard from './CheckoutCard';
import {
    PaymentMethod,
    PaymentMethodType,
    EpaymentMethodOption,
} from '@/types/orders';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface PaymentMethodCardProps {
    methods: PaymentMethod[];
    summaryTotal: number;
    selectedType: PaymentMethodType | null;
    selectedEpaymentMethodId: number | null;
    useWallet: boolean;
    walletCoversTotal: boolean;
    onChange: (type: PaymentMethodType) => void;
    onEpaymentMethodChange: (id: number) => void;
}

export default function PaymentMethodCard({
    methods,
    summaryTotal,
    selectedType,
    selectedEpaymentMethodId,
    useWallet,
    walletCoversTotal,
    onChange,
    onEpaymentMethodChange,
}: PaymentMethodCardProps) {
    const locale = useLocale();
    const t = useTranslations('Checkout');
    const isRtl = locale === 'ar';

    const getIcon = (type: string) => {
        switch (type) {
            case 'epayment':
                return <CreditCard className="w-5 h-5" />;
            case 'cod':
                return <Banknote className="w-5 h-5" />;
            case 'wallet':
                return <Wallet className="w-5 h-5" />;
            default:
                return <CreditCard className="w-5 h-5" />;
        }
    };

    const selectedMethod = methods.find((m) => m.type === selectedType);
    const codMethod = methods.find((m) => m.type === 'cod');
    const codDisabled =
        codMethod?.available &&
        codMethod.max_amount != null &&
        summaryTotal > codMethod.max_amount;

    const methodsToShow = methods.filter(
        (m) => m.type !== 'wallet' && m.available,
    );

    return (
        <CheckoutCard title={t('paymentMethodTitle')}>
            <div className="space-y-6">
                {methodsToShow.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">
                        {t('noPaymentMethodsAvailable')}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {methodsToShow.map((method) => {
                            const isCod = method.type === 'cod';
                            const disabled = isCod && codDisabled;
                            const isSelected = selectedType === method.type && !disabled;
                            return (
                                <button
                                    key={method.type}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => !disabled && onChange(method.type)}
                                    className={cn(
                                        'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right',
                                        isSelected
                                            ? 'border-theme-primary bg-theme-primary/5'
                                            : 'border-gray-100 hover:border-gray-200 bg-white',
                                        disabled &&
                                            'opacity-60 cursor-not-allowed',
                                    )}>
                                    <div
                                        className={cn(
                                            'size-10 rounded-xl flex items-center justify-center transition-colors',
                                            isSelected
                                                ? 'bg-theme-primary text-white'
                                                : 'bg-gray-100 text-gray-400',
                                        )}>
                                        {getIcon(method.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 leading-tight">
                                            {method.name}
                                        </div>
                                        {isCod &&
                                            codMethod?.max_amount != null &&
                                            !disabled && (
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {t('codMaxAmount', {
                                                        amount: codMethod.max_amount.toLocaleString(),
                                                    })}
                                                </div>
                                            )}
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 left-2 size-5 rounded-full bg-theme-primary flex items-center justify-center">
                                            <Check className="size-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {selectedType === 'epayment' &&
                    selectedMethod?.epayment_methods &&
                    selectedMethod.epayment_methods.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-sm font-bold text-gray-700 block mb-3 text-center">
                                {t('selectEpaymentMethod')}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(
                                    selectedMethod.epayment_methods as EpaymentMethodOption[]
                                ).map((option) => {
                                    const name =
                                        isRtl ? option.name_ar : option.name_en;
                                    const isSelected =
                                        selectedEpaymentMethodId === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() =>
                                                onEpaymentMethodChange(option.id)
                                            }
                                            className={cn(
                                                'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right',
                                                isSelected
                                                    ? 'border-theme-primary bg-theme-primary/5'
                                                    : 'border-gray-100 hover:border-gray-200 bg-white',
                                            )}>
                                            <div
                                                className={cn(
                                                    'size-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-gray-100',
                                                    isSelected
                                                        ? 'bg-theme-primary/10'
                                                        : 'bg-white',
                                                )}>
                                                {option.image_url ? (
                                                    <img
                                                        src={option.image_url}
                                                        alt={name}
                                                        width={32}
                                                        height={32}
                                                        className="object-contain w-8 h-8"
                                                    />
                                                ) : (
                                                    <CreditCard className="size-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {name}
                                                </div>
                                                {option.service_charge > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        +{' '}
                                                        {option.service_charge}{' '}
                                                        {option.currency}
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="size-5 rounded-full bg-theme-primary flex items-center justify-center">
                                                    <Check className="size-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
            </div>
        </CheckoutCard>
    );
}
