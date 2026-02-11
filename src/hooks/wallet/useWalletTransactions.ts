'use client';

import { useQuery } from '@tanstack/react-query';
import { walletService } from '@/services/wallet-service';
import { WalletTransaction, TransactionType } from '@/types/wallet';

export interface WalletTransactionItem {
    id: string;
    type: 'add' | 'purchase';
    title: string;
    amount: number;
    date: string;
    refNumber?: string;
}

function mapTransaction(tx: WalletTransaction): WalletTransactionItem {
    return {
        id: String(tx.id),
        type:
            tx.type === TransactionType.DEPOSIT ||
            tx.type === TransactionType.REFUND
                ? 'add'
                : 'purchase',
        title: tx.description,
        amount: Math.abs(tx.amount),
        date: new Date(tx.created_at).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }),
        refNumber: tx.reference,
    };
}

export const walletTransactionsKey = (params?: {
    page?: number;
    per_page?: number;
}) => ['wallet', 'transactions', params ?? {}] as const;

export function useWalletTransactions(params?: {
    page?: number;
    per_page?: number;
}) {
    const filters = { page: 1, per_page: 20, ...params };
    const query = useQuery({
        queryKey: walletTransactionsKey(filters),
        queryFn: async () => {
            const response = await walletService.getTransactions(filters);
            const data = response.data ?? [];
            return data.map(mapTransaction);
        },
        staleTime: 60 * 1000,
    });

    return {
        transactions: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
}
