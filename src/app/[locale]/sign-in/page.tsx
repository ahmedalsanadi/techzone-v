// src/app/[locale]/signin/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStoreConfig } from '@/services/store-config';
import SigninContent from './SigninContent';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Signin' });

    return {
        title: t('title'),
    };
}

export default async function SigninPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const config = await getStoreConfig();

    if (!config) {
        return null; // Handle error or redirect
    }

    return <SigninContent config={config} locale={locale} />;
}
