'use client';

import { CreditCard, Banknote, Wallet, Check } from 'lucide-react';
import CheckoutCard from './CheckoutCard';

import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { PaymentMethodType, PaymentMethod, EpaymentMethodOption } from '@/types/orders/orders.types';

interface PaymentMethodCardProps {
    methods: PaymentMethod[];
    summaryTotal: number;
    selectedType: PaymentMethodType | null;
    selectedEpaymentMethodId: number | null;
    useWallet: boolean;
    walletCoversTotal: boolean;
    /** When true, show wallet toggle at top of card (beside payment methods) */
    walletAvailable?: boolean;
    walletBalanceFormatted?: string;
    onUseWalletChange?: (use: boolean) => void;
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
    walletAvailable = false,
    walletBalanceFormatted = '',
    onUseWalletChange,
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
                {walletAvailable && onUseWalletChange && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <h3 className="text-md font-bold text-gray-800">
                            {t('walletDiscountTitle')}
                        </h3>
                        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 self-start sm:self-auto">
                            <span className="text-gray-500 text-sm">
                                {t('walletBalanceLabel')}
                            </span>
                            <span className="font-bold text-theme-primary">
                                {walletBalanceFormatted}
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            {(['yes', 'no'] as const).map((value) => {
                                const checked = (value === 'yes') === useWallet;
                                return (
                                    <label
                                        key={value}
                                        className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={checked}
                                            onChange={() =>
                                                onUseWalletChange(value === 'yes')
                                            }
                                            className="sr-only"
                                        />
                                        <div
                                            className={cn(
                                                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                                checked
                                                    ? 'border-theme-primary bg-theme-primary'
                                                    : 'border-gray-300 bg-white',
                                            )}>
                                            {checked && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className="text-gray-700">
                                            {t(value)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {walletCoversTotal ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-theme-primary/5 border-2 border-theme-primary/20">
                        <Wallet className="size-8 text-theme-primary shrink-0" />
                        <p className="text-gray-800 font-medium">
                            {t('payWithWalletOnly')}
                        </p>
                    </div>
                ) : methodsToShow.length === 0 ? (
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

                {!walletCoversTotal && selectedType === 'epayment' &&
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
