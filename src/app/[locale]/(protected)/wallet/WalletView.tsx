// src/app/[locale]/(protected)/wallet/WalletView.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { WalletBalanceCard } from './WalletBalanceCard';
import { TransactionList, Transaction } from './TransactionList';

import { WalletTransaction, TransactionType } from '@/types/wallet';
import { walletService } from '@/services/wallet-service';

interface WalletViewProps {
    balance: number;
}

export default function WalletView({ balance }: WalletViewProps) {
    const t = useTranslations('Wallet');
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title') },
    ];

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!mounted) return;

        const fetchTransactions = async () => {
            try {
                const response = await walletService.getTransactions({
                    page: 1,
                    per_page: 20,
                });
                const mapped: Transaction[] = (response.data || []).map(
                    (tx: WalletTransaction) => ({
                        id: String(tx.id),
                        type:
                            tx.type === TransactionType.DEPOSIT ||
                            tx.type === TransactionType.REFUND
                                ? 'add'
                                : 'purchase',
                        title: tx.description,
                        amount: Math.abs(tx.amount),
                        date: new Date(tx.created_at).toLocaleDateString(
                            'ar-SA',
                            {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            },
                        ),
                        refNumber: String(tx.reference_id),
                    }),
                );
                setTransactions(mapped);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [mounted]);

    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-6">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="mt-8 mb-12">
                    <h1 className="text-4xl font-black text-gray-900">
                        {t('title')}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: Wallet Balance */}
                    <div className="space-y-6">
                        <WalletBalanceCard balance={balance} />
                    </div>

                    {/* Main Content: Transaction History */}
                    <div className="lg:col-span-2">
                        <TransactionList transactions={transactions} />
                    </div>
                </div>
            </div>
        </main>
    );
}
