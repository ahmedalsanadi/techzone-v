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
        <footer className="w-full flex flex-col ">
            {/* Top Section: Links & Apps */}
            <div className="bg-[#FAF4F0] py-18 px-4">
                <div className="container mx-auto grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-10">
                    {/* Logo & Info */}
                    <div className="flex flex-col items-start ">
                        <div className="flex flex-col items-center mb-6">
                            <Image
                                src="/images/logo/fasto-logo.svg"
                                alt="Fasto Logo"
                                width={90}
                                height={70}
                                className="object-contain"
                            />
                            <h3 className="text-2xl text-libero-red font-semibold">
                                Fasto
                            </h3>
                        </div>
                        <p className="text-gray-600 text-[14px] leading-relaxed font-medium ">
                            {t('description')}
                        </p>
                    </div>

                    {/* Columns Order based on image */}
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
                            <li className="flex items-center gap-2 text-gray-600 font-bold text-md justify-start">
                                <Phone
                                    className="w-5 h-5 text-[#B44734]"
                                    strokeWidth={2.5}
                                />
                                <span>+966 55 123 9876</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600 font-bold text-md justify-start">
                                <Mail
                                    className="w-5 h-5 text-[#B44734]"
                                    strokeWidth={2.5}
                                />
                                <span>contact@Fasto.sa</span>
                            </li>
                        </ul>
                    </div>

                    {/* Apps Column  */}
                    <div className="flex flex-col items-start">
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
            <div className="bg-libero-red py-4 border-b border-[#FFB800]/30 relative">
                <div className="container mx-auto px-4 ">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Section: Delivery & Partners */}
                        <div className="flex items-center gap-4 ">
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

                        {/* Middle Section: Payment Methods */}
                        <div className="flex flex-wrap items-center justify-center gap-4 flex-1 max-w-3xl">
                            {paymentBadges.map((badge, idx) => (
                                <PaymentBadge
                                    key={idx}
                                    src={badge.src}
                                    altKey={badge.altKey}
                                />
                            ))}
                        </div>

                        {/* Section: Trust Badges */}
                        <div className="flex items-center gap-4 ">
                            {trustBadges.map((badge, idx) => (
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
            <div className="bg-libero-red p-4">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    {/* Copyright Left */}
                    <div className="text-white/90 text-sm font-bold">
                        {t('rights')}
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

                    {/* Social Icons */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social, idx) => (
                            <Link
                                key={idx}
                                href={social.href}
                                className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
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
