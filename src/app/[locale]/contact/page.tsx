// src/app/[locale]/contact/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getStoreConfig } from '@/services/store-config';
import {
    Mail,
    Phone,
    Instagram,
    Facebook,
    Twitter,
    ShieldCheck,
    Send,
    MessageSquareText,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { storeService } from '@/services/store-service';
import BranchErrorHandler from '@/components/pages/contact/BranchErrorHandler';
import { redirect } from '@/i18n/navigation';

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
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ branch_id?: string }>;
}) {
    const { locale } = await params;
    const { branch_id } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Contact' });
    const config = await getStoreConfig();
    const store = config?.store;

    let branch = null;
    let branchFetchError = false;

    // Validate and fetch branch if branch_id is provided
    if (branch_id) {
        // Validate branch_id is a valid number
        const branchIdNum = Number(branch_id);
        if (isNaN(branchIdNum) || branchIdNum <= 0) {
            // Invalid branch_id format - redirect to contact without branch_id
            redirect('/contact');
        }

        try {
            branch = await storeService.getBranch(branchIdNum);
            // If branch is null or undefined, treat as error
            if (!branch) {
                branchFetchError = true;
            }
        } catch (error) {
            // Log error for debugging but don't crash the page
            console.error('Failed to fetch branch for contact page:', error);
            branchFetchError = true;
            // Continue to show store contact info as fallback
        }
    }

    const pageTitle = branch ? `${t('title')} - ${branch.name}` : t('title');

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('title'), href: '/contact', active: true },
    ];

    if (branch) {
        breadcrumbItems[1].active = false;
        breadcrumbItems[1].href = '/contact';
        breadcrumbItems.push({
            label: branch.name,
            href: `/contact?branch_id=${branch_id}`,
            active: true,
        });
    }

    // Support channels logic: branch channels first, then store channels
    const displayChannels =
        branch?.support_channels && branch.support_channels.length > 0
            ? branch.support_channels
            : store?.support_channels;

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
            <BranchErrorHandler
                hasError={branchFetchError}
                branchId={branch_id}
            />
            <div className="container mx-auto px-4 max-w-6xl">
                <Breadcrumbs items={breadcrumbItems} />

                {/* Show warning if branch fetch failed but branch_id was provided */}
                {branchFetchError && branch_id && (
                    <div className="mb-6 p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">
                                {t('branch_not_found_title') ||
                                    'Branch information not available'}
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                {t('branch_not_found_message') ||
                                    'The requested branch could not be loaded. Showing store contact information instead.'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-8 mb-12">
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                        {pageTitle}
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
                                {(displayChannels && displayChannels.length > 0
                                    ? displayChannels
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
                                ).map((channel: any, idx: number) => (
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
