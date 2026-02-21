import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

// Import sub-components
import FooterColumn from './footer/FooterColumn';
import AppBadge from './footer/AppBadge';
import PaymentBadge from './footer/PaymentBadge';

import { useTranslations } from 'next-intl';
import { useStore } from '@/components/providers/StoreProvider';
import {
    footerSections,
    appBadges,
    trustBadges,
    paymentBadges,
    partnerBadges,
} from '@/config/footer';
import {
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    Ghost,
    Music2,
    Linkedin,
    MessageCircle,
    LucideIcon,
} from 'lucide-react';

const getSocialIcon = (type: string, title: string): LucideIcon => {
    const key = (type || title || '').toLowerCase();
    if (key.includes('facebook')) return Facebook;
    if (key.includes('instagram')) return Instagram;
    if (key.includes('twitter') || key.includes('x')) return Twitter;
    if (key.includes('youtube')) return Youtube;
    if (key.includes('snapchat')) return Ghost;
    if (key.includes('tiktok')) return Music2;
    if (key.includes('linkedin')) return Linkedin;
    if (key.includes('whatsapp')) return MessageCircle;
    return MessageCircle; // Default
};

const Footer = () => {
    const t = useTranslations('Footer');
    const { categories, config, cmsPages } = useStore();

    const store = config?.store;

    // 1. Memoize categories processing
    const footerCategories = useMemo(
        () => categories.filter((cat) => cat.show_in_menu).slice(0, 5),
        [categories],
    );

    // 2. Memoize CMS pages
    const footerCMSPages = useMemo(
        () => cmsPages.filter((page) => page.show_in_footer),
        [cmsPages],
    );

    // 3. Memoize Sections
    const dynamicFooterSections = useMemo(
        () =>
            footerSections.map((section) => {
                if (section.titleKey === 'sections.categories') {
                    return {
                        ...section,
                        links: footerCategories.map((cat) => ({
                            label: cat.name,
                            href: `/categories/${cat.slug || cat.id}`,
                        })),
                    };
                }
                if (section.titleKey === 'sections.about') {
                    return {
                        ...section,
                        links: [
                            { label: t('links.contactUs'), href: '/contact' },
                            ...footerCMSPages.map((page) => ({
                                label: page.title,
                                href: `/pages/${page.slug}`,
                            })),
                        ].slice(0, 5),
                    };
                }
                return section;
            }),
        [footerCategories, footerCMSPages, t],
    );

    // 5. Memoize App Badges
    const dynamicAppBadges = useMemo(
        () =>
            (store?.app_links || []).map((link) => {
                let src = appBadges[0].src;
                let altKey = 'badges.googlePlay';
                const platform = link.platform.toLowerCase();

                if (platform.includes('google')) {
                    src = '/images/badges/download-google-play-badge.svg';
                    altKey = 'badges.googlePlay';
                } else if (
                    platform.includes('apple') ||
                    platform.includes('ios')
                ) {
                    src = '/images/badges/download-app-store-badge.svg';
                    altKey = 'badges.appStore';
                } else if (platform.includes('huawei')) {
                    src = '/images/badges/download-huawei-badge.svg';
                    altKey = 'badges.appGallery';
                }

                return { src, href: link.url, altKey };
            }),
        [store?.app_links],
    );

    // 6. Memoize Social Links
    const socialLinks = useMemo(
        () =>
            (store?.social_channels || [])
                .filter((s) => s.status)
                .map((s) => ({
                    icon: getSocialIcon(s.type, s.title),
                    href: s.link,
                })),
        [store?.social_channels],
    );

    // 7. Memoize Trust Badges
    const dynamicTrustBadges = useMemo(
        () =>
            (store?.custom_links || []).map((link) => {
                let src = link.image_path;
                if (link.title.toLowerCase().includes('maroof')) {
                    src = '/images/badges/marouf-pay-badge.svg';
                }
                return {
                    srcValue: src || '/images/badges/marouf-pay-badge.svg',
                    href: link.link,
                    alt: link.title,
                };
            }),
        [store?.custom_links],
    );

    // 8. Memoize Static Trust Filtering
    const filteredStaticTrust = useMemo(
        () =>
            trustBadges.filter(
                (b) =>
                    !(
                        b.altKey === 'badges.maarof' &&
                        dynamicTrustBadges.some((dt) =>
                            dt.alt.toLowerCase().includes('maroof'),
                        )
                    ),
            ),
        [dynamicTrustBadges],
    );

    return (
        <footer className="w-full flex flex-col">
            {/* Top Section: Links & Apps */}
            <div className="bg-theme-primary-tint py-12 md:py-18 px-4 md:px-12">
                <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
                    {/* Logo & Info — single column: aligned and spaced */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-start gap-4 max-w-sm">
                        <Image
                            src={config?.store?.logo_url}
                            alt={config?.store?.name}
                            width={90}
                            height={70}
                            className="object-contain shrink-0"
                        />
                        <h3 className="text-gray-900 text-lg md:text-2xl font-black tracking-tight leading-tight">
                            {config?.store?.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium [&::selection]:bg-theme-primary/15">
                            {config?.store?.description || t('description')}
                        </p>
                    </div>

                    {/* Columns Order based on image */}
                    {dynamicFooterSections.map((section, idx) => (
                        <div key={idx} className="text-center  ">
                            <FooterColumn
                                titleKey={section.titleKey}
                                links={section.links}
                            />
                        </div>
                    ))}

                    {/* Contact Us Column */}
                    <div className="text-center ">
                        <h4 className="font-black text-gray-900 mb-6 lg:mb-8 text-xl">
                            {t('contact')}
                        </h4>
                        <ul className="space-y-4 lg:space-y-6">
                            {store?.phone && (
                                <li className="flex items-center gap-2 text-gray-600 font-bold text-md justify-center lg:justify-start">
                                    <Phone
                                        className="w-5 h-5 text-theme-primary"
                                        strokeWidth={2.5}
                                    />
                                    <span dir="ltr">{store.phone}</span>
                                </li>
                            )}
                            {store?.email && (
                                <li className="flex items-center gap-2 text-gray-600 font-bold text-md justify-center lg:justify-start">
                                    <Mail
                                        className="w-5 h-5 text-theme-primary"
                                        strokeWidth={2.5}
                                    />
                                    <span className="truncate">
                                        {store.email}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Apps Column  */}
                    <div className="flex flex-col items-center lg:items-start text-center  ">
                        <h4 className="font-black text-gray-900 mb-6 lg:mb-8 text-xl">
                            {t('downloadApp')}
                        </h4>
                        <div className="flex flex-row lg:flex-col gap-4 justify-center">
                            {dynamicAppBadges.map((badge, idx) => (
                                <AppBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    href={badge.href}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Partners & Payment Strip */}
            <div className="bg-theme-primary py-8 lg:py-4 border-b border-theme-secondary/30 relative">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 px-4 md:px-10">
                        {/* Section: Delivery & Partners */}
                        <div className="flex flex-wrap justify-center items-center gap-4">
                            {partnerBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    width={90}
                                    height={45}
                                    className="h-8 lg:h-10 w-auto"
                                />
                            ))}
                        </div>

                        {/* Middle Section: Payment Methods */}
                        <div className="flex flex-wrap items-center justify-center gap-4 lg:flex-1 w-full max-w-3xl">
                            {paymentBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                />
                            ))}
                        </div>

                        {/* Section: Trust Badges */}
                        <div className="flex flex-wrap justify-center items-center gap-4">
                            {/* Static Trust Badges (like Saudi Business Center) */}
                            {filteredStaticTrust.map((badge, idx) => (
                                <PaymentBadge
                                    key={`static-trust-${idx}`}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    width={90}
                                    height={45}
                                    className="h-8 lg:h-10 w-auto"
                                />
                            ))}
                            {/* Dynamic Trust Badges from API (like verified Maroof links) */}
                            {dynamicTrustBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={`dynamic-trust-${idx}`}
                                    src={badge.srcValue}
                                    altKey={badge.alt}
                                    href={badge.href}
                                    width={90}
                                    height={45}
                                    className="h-8 lg:h-10 w-auto"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Socials, Powered By & Copyright */}
            <div className="bg-theme-primary py-6 lg:py-4 ">
                <div className="container mx-auto px-4 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
                    {/* Copyright Left */}
                    <div className="text-white/90 text-sm font-bold text-center   order-3 lg:order-1">
                        {t('rights')}
                    </div>

                    {/* Powered By Center */}
                    <div className="flex items-center gap-2 order-2 lg:order-2">
                        <span className="text-white/90 text-[15px] font-bold">
                            {t('poweredBy')}
                        </span>
                        <Image
                            src="/images/logo/libero-copywrite.svg"
                            width={90}
                            height={30}
                            alt="Libro"
                            className="h-7 w-auto brightness-0 invert"
                        />
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-6 lg:gap-4 order-1 lg:order-3">
                        {socialLinks.map((social, idx) => (
                            <Link
                                key={idx}
                                href={social.href}
                                className="text-white/90 hover:text-theme-secondary transition-colors drop-shadow-sm scale-110 lg:scale-100">
                                <social.icon className="w-5 h-5" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
