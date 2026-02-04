// src/app/[locale]/(protected)/wallet/page.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import WalletView from './WalletView';
import { walletService } from '@/services/wallet-service';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Wallet' });

    return {
        title: t('title'),
    };
}

export default async function WalletPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    // Fetch real balance from the API
    let balanceData = { balance: 0, pending_balance: 0, is_active: false };
    try {
        balanceData = await walletService.getBalance();
    } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
    }

    return <WalletView balance={balanceData.balance} />;
}
