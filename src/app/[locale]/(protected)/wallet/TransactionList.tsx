// src/app/[locale]/(protected)/wallet/TransactionList.tsx
'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export interface Transaction {
    id: string;
    type: 'add' | 'purchase';
    title: string;
    amount: number;
    date: string;
    refNumber?: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    isLoading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
    transactions,
    isLoading = false,
}) => {
    const t = useTranslations('Wallet');
    const locale = useLocale();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-theme-primary rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">
                    {t('transactions')}
                </h2>
            </div>

            <div className="space-y-4">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:shadow-gray-100 group flex items-center justify-between gap-4">
                        {/* Transaction Details */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2 max-w-full">
                                <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">
                                    {tx.type === 'purchase' && tx.refNumber
                                        ? t('orderPurchase', {
                                              number: tx.refNumber,
                                          })
                                        : tx.title}
                                </h3>
                            </div>
                            <div
                                className={cn(
                                    'flex items-center gap-1 font-black text-base md:text-xl transition-transform',
                                    tx.type === 'add'
                                        ? 'text-emerald-500'
                                        : 'text-rose-500',
                                )}>
                                {tx.type === 'add' ? (
                                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 ml-1" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 md:w-6 md:h-6 ml-1" />
                                )}
                                <span>
                                    {tx.type === 'add' ? '+' : '-'}
                                    {formatCurrency(tx.amount, locale)}
                                </span>
                            </div>
                        </div>

                        {/* Transaction Date */}
                        <div className="text-sm font-bold text-gray-500">
                            {tx.date}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
