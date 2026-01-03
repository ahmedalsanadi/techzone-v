'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Phone,
    Mail,
    Instagram,
    Facebook,
    Youtube,
    Linkedin,
    MessageCircle,
    Twitter,
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full flex flex-col font-sans" dir="rtl">
            {/* Top Section: Links & Apps */}
            <div className="bg-[#FAF4F0] py-16 px-4">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                    {/* Logo & Info */}
                    <div className="lg:col-span-1 border-gray-200">
                        <div className="flex flex-col items-start gap-4">
                            <Image
                                src="/images/logo/fasto-logo.svg"
                                alt="Fasto Logo"
                                width={120}
                                height={60}
                                className="object-contain"
                            />
                            <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                                نقدّم في مطعمنا تجربة طعام تجمع بين الجودة
                                العالية والطعم المميّز، باستخدام أفضل المكونات
                                الطازجة وبإشراف فريق متخصّص لضمان أعلى معايير
                                النظافة والجودة.
                            </p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 text-lg">
                            الاقسام
                        </h4>
                        <ul className="space-y-4 text-gray-500 font-medium">
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

                    {/* More */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 text-lg">
                            المزيد
                        </h4>
                        <ul className="space-y-4 text-gray-500 font-medium">
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

                    {/* About Fasto */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 text-lg">
                            عن فاستو
                        </h4>
                        <ul className="space-y-4 text-gray-500 font-medium">
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

                    {/* Contact Us */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 text-lg">
                            تواصل معنا
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-500 font-medium group">
                                <div className="bg-[#B44734]/10 p-2 rounded-lg group-hover:bg-[#B44734] group-hover:text-white transition-all">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span dir="ltr">+966 55 123 9876</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 font-medium group">
                                <div className="bg-[#B44734]/10 p-2 rounded-lg group-hover:bg-[#B44734] group-hover:text-white transition-all">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span>contact@Fasto.sa</span>
                            </li>
                        </ul>
                    </div>

                    {/* Download App */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 text-lg">
                            حمل التطبيق
                        </h4>
                        <div className="flex flex-col gap-4">
                            <Link href="/">
                                <Image
                                    src="/images/badges/download-app-store-badge.svg"
                                    width={160}
                                    height={48}
                                    alt="Download on App Store"
                                    className="hover:scale-105 transition-transform"
                                />
                            </Link>
                            <Link href="/">
                                <Image
                                    src="/images/badges/download-google-play-badge.svg"
                                    width={160}
                                    height={48}
                                    alt="Get it on Google Play"
                                    className="hover:scale-105 transition-transform"
                                />
                            </Link>
                            <Link href="/">
                                <Image
                                    src="/images/badges/download-huawei-badge.svg"
                                    width={160}
                                    height={48}
                                    alt="Explore it on AppGallery"
                                    className="hover:scale-105 transition-transform"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Partners & Payment */}
            <div className="bg-[#B44734] py-8 border-b border-white/10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 opacity-90">
                        <Image
                            src="/images/badges/marouf-pay-badge.svg"
                            width={90}
                            height={36}
                            alt="Marouf"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/saudi-business-center-badge.svg"
                            width={90}
                            height={36}
                            alt="Saudi Business Center"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/master-pay-badge.svg"
                            width={60}
                            height={36}
                            alt="Mastercard"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/mada-pay-badge.svg"
                            width={60}
                            height={36}
                            alt="Mada"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/visa-pay-badge.svg"
                            width={60}
                            height={36}
                            alt="VISA"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/e-pay-badge.svg"
                            width={80}
                            height={36}
                            alt="Apple Pay"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/stc-pay-badge.svg"
                            width={80}
                            height={36}
                            alt="STC Pay"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/tamara-pay-badge.svg"
                            width={80}
                            height={36}
                            alt="Tamara"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/tabby-pay-badge.svg"
                            width={80}
                            height={36}
                            alt="Tabby"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/kareem-pay-badge.svg"
                            width={80}
                            height={36}
                            alt="Careem"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/libero-pay-badge.svg"
                            width={80}
                            height={36}
                            alt="Libro"
                            className="h-9 w-auto object-contain"
                        />
                        <Image
                            src="/images/badges/driver-pay-badge.svg"
                            width={80}
                            height={36}
                            alt="Driver"
                            className="h-9 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Socials & Copyright */}
            <div className="bg-[#B44734] py-6 px-4">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Socials */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white transition-all hover:scale-125">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white transition-all hover:scale-125">
                            <Facebook className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white transition-all hover:scale-125">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white transition-all hover:scale-125">
                            <Youtube className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white transition-all hover:scale-125">
                            <MessageCircle className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white transition-all hover:scale-125">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Powered By */}
                    <div className="flex items-center gap-2 text-white">
                        <span className="text-sm opacity-80">يعمل بواسطة</span>
                        <Image
                            src="/images/logo/libero-copywrite.svg"
                            width={74}
                            height={27}
                            alt="Libro"
                        />
                    </div>

                    {/* Copyright */}
                    <div className="text-white/80 text-sm font-medium">
                        جميع الحقوق محفوظة © 2025
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
