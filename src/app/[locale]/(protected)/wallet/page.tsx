// src/app/[locale]/(protected)/wallet/page.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import WalletView from './WalletView';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

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
    // For demo purposes, using a mock balance
    const balance = 35.0;

    return <WalletView balance={balance} />;
}
