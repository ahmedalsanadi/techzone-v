'use client';

import CheckoutCard from './CheckoutCard';
import { useTranslations } from 'next-intl';

interface WalletDiscountCardProps {
    balance: string;
    selected: 'yes' | 'no';
    onChange: (value: 'yes' | 'no') => void;
}

export default function WalletDiscountCard({
    balance,
    selected,
    onChange,
}: WalletDiscountCardProps) {
    const t = useTranslations('Checkout');

    return (
        <CheckoutCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-md sm:text-lg font-bold text-gray-800">
                    {t('walletDiscountTitle')}
                </h2>
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 self-start sm:self-auto">
                    <span className="text-gray-500 text-sm">
                        {t('walletBalanceLabel')}
                    </span>
                    <span className="font-bold text-theme-primary">
                        {balance}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {(['yes', 'no'] as const).map((value) => (
                    <label
                        key={value}
                        className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            checked={selected === value}
                            onChange={() => onChange(value)}
                            className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded-full border-2 border-theme-primary peer-checked:bg-theme-primary flex items-center justify-center transition-all">
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <span className="text-gray-700">
                            {t(value)}
                        </span>
                    </label>
                ))}
            </div>
        </CheckoutCard>
    );
}
