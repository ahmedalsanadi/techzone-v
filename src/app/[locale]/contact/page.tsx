// src/app/[locale]/contact/page.tsx
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getContactData } from '@/lib/contact/getContactData';
import { getContactBreadcrumbs } from '@/lib/contact/getBreadcrumbs';
import { SupportChannels } from '@/components/contact/SupportChannels';
import { SocialMediaChannels } from '@/components/contact/SocialMediaChannels';
import { ContactForm } from '@/components/contact/ContactForm';
import { BranchWarning } from '@/components/contact/BranchWarning';
import BranchErrorHandler from '@/components/contact/BranchErrorHandler';

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

    const { branch, branchFetchError, store } = await getContactData(branch_id);

    const pageTitle = branch ? `${t('title')} - ${branch.name}` : t('title');
    const breadcrumbItems = getContactBreadcrumbs(t, branch, branch_id);

    // Support channels: branch channels first, then store channels
    // Map store channels to BranchSupportChannel format (add status property)
    const displayChannels =
        branch?.support_channels && branch.support_channels.length > 0
            ? branch.support_channels
            : store?.support_channels?.map((channel) => ({
                  type: channel.type,
                  title: channel.title,
                  value: channel.value,
                  status: true, // Store channels are always active
              })) || null;

    return (
        <div className="space-y-8">
            <BranchErrorHandler
                hasError={branchFetchError}
                branchId={branch_id}
            />
            <div className="space-y-8">
                <Breadcrumbs items={breadcrumbItems} />

                {/* Show warning if branch fetch failed */}
                {branchFetchError && branch_id && (
                    <BranchWarning
                        title={
                            t('branch_not_found_title') ||
                            'Branch information not available'
                        }
                        message={
                            t('branch_not_found_message') ||
                            'The requested branch could not be loaded. Showing store contact information instead.'
                        }
                    />
                )}

                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                        {pageTitle}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <SupportChannels
                            channels={displayChannels}
                            title={t('support')}
                        />
                        <SocialMediaChannels
                            channels={store?.social_channels}
                            title={t('social')}
                        />
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
