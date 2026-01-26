// src/app/[locale]/(protected)/wallet/WalletView.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { WalletBalanceCard } from './WalletBalanceCard';
import { TransactionList, Transaction } from './TransactionList';

interface WalletViewProps {
    balance: number;
}

export default function WalletView({ balance }: WalletViewProps) {
    const t = useTranslations('Wallet');

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title') },
    ];

    // Mock transactions
    const transactions: Transaction[] = [
        {
            id: '1',
            type: 'add',
            title: t('addBalanceTitle'),
            amount: 35.0,
            date: '30/10/2024',
        },
        {
            id: '2',
            type: 'purchase',
            title: '',
            refNumber: '7863',
            amount: 35.0,
            date: '30/10/2024',
        },
        {
            id: '3',
            type: 'add',
            title: t('addBalanceTitle'),
            amount: 35.0,
            date: '30/10/2024',
        },
        {
            id: '4',
            type: 'purchase',
            title: '',
            refNumber: '7863',
            amount: 35.0,
            date: '30/10/2024',
        },
        {
            id: '5',
            type: 'add',
            title: t('addBalanceTitle'),
            amount: 35.0,
            date: '30/10/2024',
        },
        {
            id: '6',
            type: 'purchase',
            title: '',
            refNumber: '7863',
            amount: 35.0,
            date: '30/10/2024',
        },
        {
            id: '7',
            type: 'add',
            title: t('addBalanceTitle'),
            amount: 35.0,
            date: '30/10/2024',
        },
        {
            id: '8',
            type: 'purchase',
            title: '',
            refNumber: '7863',
            amount: 35.0,
            date: '30/10/2024',
        },
    ];

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
