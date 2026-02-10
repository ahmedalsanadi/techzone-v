// src/app/[locale]/auth/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getServerStoreConfig } from '@/services/store-config';
import AuthFlow from './AuthFlow';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Auth' });

    return {
        title: t('title'),
    };
}

export default async function AuthPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ step?: string; redirect?: string }>;
}) {
    const { locale } = await params;
    const { step, redirect } = await searchParams;
    // Use shared server context to avoid duplicate API calls
    const config = await getServerStoreConfig();

    if (!config) {
        return null;
    }

    return <AuthFlow config={config} locale={locale} initialStep={step} redirectTo={redirect} />;
}
