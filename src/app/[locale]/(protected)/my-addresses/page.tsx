// src/app/[locale]/(protected)/my-addresses/page.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MyAddressesView from './MyAddressesView';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('MyAddresses');
    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default function MyAddressesPage() {
    return <MyAddressesView />;
}
