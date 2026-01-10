// src/app/[locale]/terms/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { FileText, Shield, Lock, CreditCard, Truck, RotateCcw } from 'lucide-react';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Terms' });

    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function TermsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Terms' });

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title'), href: '/terms', active: true },
    ];

    const sections = [
        {
            icon: Shield,
            title: t('sections.acceptance.title'),
            content: t('sections.acceptance.content'),
        },
        {
            icon: FileText,
            title: t('sections.orders.title'),
            content: t('sections.orders.content'),
        },
        {
            icon: CreditCard,
            title: t('sections.payment.title'),
            content: t('sections.payment.content'),
        },
        {
            icon: Truck,
            title: t('sections.delivery.title'),
            content: t('sections.delivery.content'),
        },
        {
            icon: RotateCcw,
            title: t('sections.returns.title'),
            content: t('sections.returns.content'),
        },
        {
            icon: Lock,
            title: t('sections.privacy.title'),
            content: t('sections.privacy.content'),
        },
    ];

    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="mt-8 mb-12">
                    <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {t('lastUpdated')}
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="space-y-12">
                        {/* Introduction */}
                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 leading-relaxed text-lg">
                                {t('introduction')}
                            </p>
                        </div>

                        {/* Sections */}
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={index}
                                    className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-libero-red/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-6 h-6 text-libero-red" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 flex-1">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <div className="ms-16">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Contact Information */}
                        <div className="mt-12 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {t('contact.title')}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {t('contact.content')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
