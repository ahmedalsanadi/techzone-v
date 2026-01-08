// src/app/[locale]/contact/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { storeService } from '@/services/store-service';
import {
    Mail,
    Phone,
    Instagram,
    Facebook,
    Twitter,
    ShieldCheck,
    Send,
    MessageSquareText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Contact' });

    return {
        title: t('title'),
    };
}

export default async function ContactPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Contact' });
    const config = await storeService.getConfig();
    const store = config?.store;

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title'), href: '/contact', active: true },
    ];

    // Map social media types to icons
    const getSocialIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'facebook':
                return <Facebook className="w-5 h-5 text-blue-600" />;
            case 'instagram':
                return <Instagram className="w-5 h-5 text-pink-600" />;
            case 'twitter':
                return <Twitter className="w-5 h-5 text-blue-400" />;
            case 'whatsapp':
                return <Phone className="w-5 h-5 text-green-500" />;
            // Default to a generic icon if type is unknown
            default:
                return <MessageSquareText className="w-5 h-5 text-[#B44734]" />;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="mt-8 mb-12">
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                        {t('title')}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Technical Support Card */}
                        <div className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 text-start">
                                {t('support')}
                            </h2>

                            <div className="space-y-6">
                                {(store?.support_channels &&
                                store.support_channels.length > 0
                                    ? store.support_channels
                                    : [
                                          {
                                              type: 'phone',
                                              value: '+966 55 123 9876',
                                          },
                                          {
                                              type: 'email',
                                              value: 'contact@Fasto.sa',
                                          },
                                      ]
                                ).map((channel, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-start gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-[#B44734]/20 transition-all">
                                            {channel.type === 'email' ? (
                                                <Mail
                                                    size={20}
                                                    className="text-gray-400 group-hover:text-[#B44734]"
                                                />
                                            ) : (
                                                <Phone
                                                    size={20}
                                                    className="text-gray-400 group-hover:text-[#B44734]"
                                                />
                                            )}
                                        </div>
                                        <span
                                            className="text-gray-600 font-medium group-hover:text-[#B44734] transition-colors"
                                            dir={
                                                channel.type === 'phone'
                                                    ? 'ltr'
                                                    : undefined
                                            }>
                                            {channel.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 text-start">
                                {t('social')}
                            </h2>

                            <div className="space-y-4">
                                {store?.social_channels?.length ? (
                                    store.social_channels.map(
                                        (channel, idx) => (
                                            <a
                                                key={idx}
                                                href={channel.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-start gap-4 p-2 rounded-2xl hover:bg-white transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                                    {getSocialIcon(
                                                        channel.type,
                                                    )}
                                                </div>
                                                <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                                    @{channel.title}
                                                </span>
                                            </a>
                                        ),
                                    )
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        لا توجد قنوات تواصل اجتماعي
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 h-full">
                            <form className="space-y-8">
                                <div className="space-y-6">
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 block text-start">
                                            {t('form.email')}
                                        </label>
                                        <input
                                            type="email"
                                            placeholder={t(
                                                'form.placeholder_email',
                                            )}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all text-start"
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 block text-start">
                                            {t('form.subject')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t(
                                                'form.placeholder_subject',
                                            )}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all text-start"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 block text-start">
                                            {t('form.message')}
                                        </label>
                                        <textarea
                                            rows={8}
                                            className="w-full p-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all resize-none text-start"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        className="h-10 px-14 rounded-lg bg-[#B44734] hover:bg-[#9E3E2D] text-white font-bold text-md shadow-lg shadow-[#B44734]/20 transition-all active:scale-95">
                                        {t('form.send')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
