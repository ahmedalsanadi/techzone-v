// src/services/wallet-service.ts
import { fetchLibero, fetchLiberoFull } from './api';
import { WalletBalance, WalletTransaction } from '@/types/wallet';

export const walletService = {
    /**
     * Get wallet balance.
     */
    getBalance: () =>
        fetchLibero<WalletBalance>('/store/wallet', {
            isProtected: true,
        }),

    /**
     * Get wallet transactions.
     */
    getTransactions: (params?: { page?: number; per_page?: number }) =>
        fetchLiberoFull<WalletTransaction[]>('/store/wallet/transactions', {
            params,
            isProtected: true,
        }),
};
