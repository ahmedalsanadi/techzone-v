'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

// Import sub-components
import FooterColumn from './footer/FooterColumn';
import AppBadge from './footer/AppBadge';
import PaymentBadge from './footer/PaymentBadge';

// Import data
import {
    footerSections,
    appBadges,
    trustBadges,
    paymentBadges,
    partnerBadges,
    socialLinks,
} from './footer/FooterData';
import { useTranslations } from 'next-intl';

const Footer = () => {
    const t = useTranslations('Footer');

    return (
        <footer className="w-full flex flex-col font-sans" dir="rtl">
            {/* Top Section: Links & Apps */}
            <div className="bg-[#FAF4F0] py-20 px-4">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
                    {/* Logo & Info - Rightmost in RTL */}
                    <div className="flex flex-col items-start lg:items-center text-right">
                        <div className="flex flex-col items-center mb-6">
                            <Image
                                src="/images/logo/fasto-logo.svg"
                                alt="Fasto Logo"
                                width={100}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                        <p className="text-gray-600 text-[14px] leading-relaxed font-medium lg:text-center">
                            {t('description')}
                        </p>
                    </div>

                    {/* Columns Order based on image (R-L) */}
                    {footerSections.map((section, idx) => (
                        <FooterColumn
                            key={idx}
                            titleKey={section.titleKey}
                            links={section.links}
                        />
                    ))}

                    {/* Contact Us Column */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-8 text-xl">
                            {t('contact')}
                        </h4>
                        <ul className="space-y-6">
                            <li className="flex items-center gap-3 text-gray-600 font-black text-lg justify-end">
                                <span dir="ltr">+966 55 123 9876</span>
                                <Phone
                                    className="w-6 h-6 text-[#B44734]"
                                    strokeWidth={2.5}
                                />
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 font-black text-lg justify-end">
                                <span>contact@Fasto.sa</span>
                                <Mail
                                    className="w-6 h-6 text-[#B44734]"
                                    strokeWidth={2.5}
                                />
                            </li>
                        </ul>
                    </div>

                    {/* Apps Column - Leftmost in RTL */}
                    <div className="flex flex-col items-start lg:items-end">
                        <h4 className="font-black text-gray-900 mb-8 text-xl">
                            {t('downloadApp')}
                        </h4>
                        <div className="flex flex-col gap-4">
                            {appBadges.map((badge, idx) => (
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
            <div className="bg-[#B44734] pt-10 pb-6 border-b border-[#FFB800]/30 relative">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Right Section: Trust Badges */}
                        <div className="flex items-center gap-4 md:gap-6">
                            {trustBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    width={badge.width}
                                    height={45}
                                    className="h-10 w-auto"
                                />
                            ))}
                        </div>

                        {/* Middle Section: Payment Methods */}
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 flex-1 max-w-2xl">
                            {paymentBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                />
                            ))}
                        </div>

                        {/* Left Section: Delivery & Partners */}
                        <div className="flex items-center gap-4 md:gap-6">
                            {partnerBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                    width={90}
                                    height={45}
                                    className="h-10 w-auto"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Socials, Powered By & Copyright */}
            <div className="bg-[#B44734] py-8 px-4">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    {/* Social Icons */}
                    <div className="flex items-center gap-6">
                        {socialLinks.map((social, idx) => (
                            <Link
                                key={idx}
                                href={social.href}
                                className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                                <social.icon className="w-5 h-5" />
                            </Link>
                        ))}
                    </div>

                    {/* Powered By Center */}
                    <div className="flex items-center gap-2">
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

                    {/* Copyright Left */}
                    <div className="text-white/90 text-sm font-bold">
                        {t('rights')}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
