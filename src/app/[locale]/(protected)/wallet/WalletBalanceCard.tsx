// src/app/[locale]/(protected)/wallet/WalletBalanceCard.tsx
'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatMoneyAmount } from '@/lib/utils';
import CurrencySymbol from '@/components/ui/CurrencySymbol';

interface WalletBalanceCardProps {
    balance: number;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
    balance,
}) => {
    const t = useTranslations('Wallet');
    const locale = useLocale();

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-center">
                {/* Balance Info */}
                <div className="">
                    <p className="text-sm md:text-md font-bold text-gray-500 mb-1">
                        {t('balance')}
                    </p>
                    <div className="flex items-center gap-1 justify-center ">
                        <span className="text-2xl md:text-4xl font-bold text-theme-primary flex items-center gap-1.5 ">
                            {formatMoneyAmount(balance, locale)}
                            <CurrencySymbol className="w-5 h-5 md:w-8 md:h-8" />
                        </span>
                    </div>
                </div>
                {/* Add Balance Button */}
                <Button
                    size="lg"
                    className=" mt-6 rounded-xl bg-theme-primary/10 text-theme-primary font-bold hover:bg-theme-primary/20 active:scale-95 text-sm md:text-md">
                    <Plus />
                    {t('addBalance')}
                </Button>
            </div>
        </div>
    );
};
