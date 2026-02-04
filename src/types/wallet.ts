// src/types/wallet.ts

export enum TransactionType {
    DEPOSIT = 1,
    WITHDRAWAL = 2,
    REFUND = 3,
    ADJUSTMENT = 4,
}

export type TransactionStatus =
    | 'pending'
    | 'completed'
    | 'failed'
    | 'cancelled';

export interface WalletBalance {
    balance: number;
    pending_balance: number;
    is_active: boolean;
}

export interface WalletTransaction {
    id: number;
    type: TransactionType;
    type_label: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    reference_type: string;
    reference_id: number;
    description: string;
    status: TransactionStatus;
    created_at: string;
}
