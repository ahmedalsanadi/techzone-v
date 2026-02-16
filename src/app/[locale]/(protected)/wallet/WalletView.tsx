// src/app/[locale]/(protected)/wallet/WalletView.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { WalletBalanceCard } from './WalletBalanceCard';
import { TransactionList } from './TransactionList';
import { useWalletTransactions } from '@/hooks/wallet';
import { Loader2 } from 'lucide-react';

interface WalletViewProps {
    balance: number;
}

export default function WalletView({ balance }: WalletViewProps) {
    const t = useTranslations('Wallet');
    const { transactions, isLoading, error } = useWalletTransactions({
        page: 1,
        per_page: 20,
    });

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title') },
    ];

    return (
            <div className="space-y-6">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="mt-8 mb-12">
                    <h1 className="text-4xl font-black text-gray-900">
                        {t('title')}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <WalletBalanceCard balance={balance} />
                    </div>

                    <div className="lg:col-span-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-10 h-10 text-theme-primary animate-spin" />
                            </div>
                        ) : error ? (
                            <p className="text-red-600 font-medium py-8">
                                {t('transactionsError') ||
                                    'Failed to load transactions.'}
                            </p>
                        ) : (
                            <TransactionList transactions={transactions} />
                        )}
                    </div>
                </div>
            </div>
    );
}
