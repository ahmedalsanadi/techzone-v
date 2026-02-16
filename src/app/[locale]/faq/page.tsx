// src/app/[locale]/faq/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FAQList from './FAQList';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'FAQ' });

    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function FAQPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'FAQ' });

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title'), href: '/faq', active: true },
    ];

    // Get translated questions
    // Since i18n JSON arrays are tricky with getTranslations in some versions,
    // we'll fetch them individually or use the raw messages if needed.
    // But usually t.raw('questions') works or we can define them here if they are static.

    const messages = await getTranslations({ locale, namespace: 'FAQ' });
    const questionsCount = 5; // We know we have 5
    const questions = Array.from({ length: questionsCount }).map((_, i) => ({
        question: messages(`questions.${i}.question`),
        answer: messages(`questions.${i}.answer`),
    }));

    return (
        <div className="space-y-8">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
                    {t('title')}
                </h1>
            </div>

            <FAQList questions={questions} />
        </div>
    );
}
