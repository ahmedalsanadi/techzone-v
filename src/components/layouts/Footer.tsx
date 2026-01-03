'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    Ghost,
    Music2,
    Linkedin,
    Phone,
    Mail,
    MessageCircle,
} from 'lucide-react';

const Footer = () => {
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
                            نقدّم في مطعمنا تجربة طعام تجمع بين الجودة العالية
                            والطعم المميّز، باستخدام أفضل المكونات الطازجة
                            وبإشراف فريق متخصّص لضمان أعلى معايير النظافة
                            والجودة.
                        </p>
                    </div>

                    {/* Columns Order based on image (R-L) */}

                    {/* Categories Column */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-8 text-xl">
                            الاقسام
                        </h4>
                        <ul className="space-y-4 text-gray-500 font-bold text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    الحلويات
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    البرجر
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    البيتزا
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    وجبات
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    المشروبات
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* More Column */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-8 text-xl">
                            المزيد
                        </h4>
                        <ul className="space-y-4 text-gray-500 font-bold text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    عناويني
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    المحفظة
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    المفضلة
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    ملفي الشخصي
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About Fasto Column */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-8 text-xl">
                            عن فاستو
                        </h4>
                        <ul className="space-y-4 text-gray-500 font-bold text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    اتصل بنا
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    الاسئلة الشائعة
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-[#B44734] transition-colors">
                                    الشروط والاحكام
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us Column */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-8 text-xl">
                            تواصل معنا
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
                            حمل التطبيق
                        </h4>
                        <div className="flex flex-col gap-4">
                            <Link href="/">
                                <Image
                                    src="/images/badges/download-app-store-badge.svg"
                                    alt="App Store"
                                    width={180}
                                    height={54}
                                    className="hover:scale-105 transition-transform"
                                />
                            </Link>
                            <Link href="/">
                                <Image
                                    src="/images/badges/download-google-play-badge.svg"
                                    alt="Google Play"
                                    width={180}
                                    height={54}
                                    className="hover:scale-105 transition-transform"
                                />
                            </Link>
                            <Link href="/">
                                <Image
                                    src="/images/badges/download-huawei-badge.svg"
                                    alt="AppGallery"
                                    width={180}
                                    height={54}
                                    className="hover:scale-105 transition-transform"
                                />
                            </Link>
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
                            <Image
                                src="/images/badges/marouf-pay-badge.svg"
                                width={90}
                                height={45}
                                alt="Maarof"
                                className="h-10 w-auto"
                            />
                            <Image
                                src="/images/badges/saudi-business-center-badge.svg"
                                width={110}
                                height={45}
                                alt="Saudi Business"
                                className="h-10 w-auto"
                            />
                        </div>

                        {/* Middle Section: Payment Methods */}
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 flex-1 max-w-2xl">
                            <Image
                                src="/images/badges/master-pay-badge.svg"
                                width={80}
                                height={40}
                                alt="Mastercard"
                                className="h-9 w-auto"
                            />
                            <Image
                                src="/images/badges/mada-pay-badge.svg"
                                width={80}
                                height={40}
                                alt="Mada"
                                className="h-9 w-auto"
                            />
                            <Image
                                src="/images/badges/visa-pay-badge.svg"
                                width={80}
                                height={40}
                                alt="Visa"
                                className="h-9 w-auto"
                            />
                            <Image
                                src="/images/badges/e-pay-badge.svg"
                                width={80}
                                height={40}
                                alt="Apple Pay"
                                className="h-9 w-auto"
                            />
                            <Image
                                src="/images/badges/stc-pay-badge.svg"
                                width={80}
                                height={40}
                                alt="STC Pay"
                                className="h-9 w-auto"
                            />
                            <Image
                                src="/images/badges/tamara-pay-badge.svg"
                                width={80}
                                height={40}
                                alt="Tamara"
                                className="h-9 w-auto"
                            />
                            <Image
                                src="/images/badges/tabby-pay-badge.svg"
                                width={80}
                                height={40}
                                alt="Tabby"
                                className="h-9 w-auto"
                            />
                        </div>

                        {/* Left Section: Delivery & Partners */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <Image
                                src="/images/badges/kareem-pay-badge.svg"
                                width={90}
                                height={45}
                                alt="Careem"
                                className="h-10 w-auto"
                            />
                            <Image
                                src="/images/badges/libero-pay-badge.svg"
                                width={90}
                                height={45}
                                alt="Libro"
                                className="h-10 w-auto"
                            />
                            <Image
                                src="/images/badges/driver-pay-badge.svg"
                                width={90}
                                height={45}
                                alt="Driver"
                                className="h-10 w-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Socials, Powered By & Copyright */}
            <div className="bg-[#B44734] py-8 px-4">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    {/* Social Icons */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <Facebook className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <Youtube className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <Ghost className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <Music2 className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/90 hover:text-[#FFB800] transition-colors drop-shadow-sm">
                            <MessageCircle className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Powered By Center */}
                    <div className="flex items-center gap-2">
                        <span className="text-white/90 text-[15px] font-bold">
                            يعمل بواسطة
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
                        جميع الحقوق محفوظة © 2025
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
