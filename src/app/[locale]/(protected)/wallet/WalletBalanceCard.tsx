// src/app/[locale]/(protected)/wallet/WalletBalanceCard.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CurrencySymbol from '@/components/ui/CurrencySymbol';

interface WalletBalanceCardProps {
    balance: number;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
    balance,
}) => {
    const t = useTranslations('Wallet');

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
                {/* Add Balance Button */}
                <Button
                    variant="ghost"
                    className="h-10 px-6 rounded-xl bg-theme-primary/10 text-theme-primary font-bold hover:bg-theme-primary/20 transition-all active:scale-95 text-sm md:text-md order-2 md:order-1">
                    <Plus className="w-4 h-4 mr-1 lg:hidden xl:inline-block" />
                    {t('addBalance')}
                </Button>

                {/* Balance Info */}
                <div className="text-center md:text-end order-1 md:order-2">
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 pl-1">
                        {t('balance')}
                    </p>
                    <div className="flex items-center gap-1 justify-center md:justify-end">
                        <span className="text-2xl md:text-4xl font-black text-theme-primary">
                            {balance.toFixed(2)}
                        </span>
                        <CurrencySymbol className="w-5 h-5 md:w-6 md:h-6 text-theme-primary" />
                    </div>
                </div>
            </div>
        </div>
    );
};
