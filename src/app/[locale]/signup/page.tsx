// src/app/[locale]/signup/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { storeService } from '@/services/store-service';
import SignupContent from './SignupContent';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Signup' });

    return {
        title: t('title'),
    };
}

export default async function SignupPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const config = await storeService.getConfig();

    if (!config) {
        return null; // Handle error or redirect
    }

    return <SignupContent config={config} locale={locale} />;
}
