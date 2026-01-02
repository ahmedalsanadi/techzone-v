'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function LandingPage() {
    return (
        <div
            className="bg-white content-stretch flex flex-col isolate items-center relative size-full"
            data-name="landing page">
            <div className="w-full max-w-[1920px] flex flex-col items-end relative">
                {/* --- NAVIGATION --- */}
                <div
                    className="bg-[#b44734] content-stretch flex flex-col items-end justify-center shrink-0 sticky top-0 w-full z-[50]"
                    data-name="nav">
                    <div className="relative shrink-0 w-full">
                        <div className="flex flex-row items-center size-full">
                            <div className="content-stretch flex items-center justify-between pb-0 pt-[12px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-32 relative w-full">
                                {/* Left side of Nav: User, Cart, Notif, Lang, Search */}
                                <div className="content-stretch flex gap-4 md:gap-6 items-center relative shrink-0">
                                    <div className="content-stretch flex gap-2 md:gap-4 items-center justify-end relative shrink-0">
                                        {/* User Profile */}
                                        <div className="bg-white content-stretch flex gap-[4px] items-center justify-end p-[4px] relative rounded-[32px] shrink-0 border border-black/5 shadow-sm">
                                            <div className="overflow-clip relative shrink-0 size-[16px]">
                                                <svg
                                                    className="block size-full"
                                                    fill="none"
                                                    preserveAspectRatio="none"
                                                    viewBox="0 0 16 16">
                                                    <g id="Group">
                                                        <path
                                                            clipRule="evenodd"
                                                            d="M8 1c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 1c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6z"
                                                            fill="#B44734"
                                                            fillRule="evenodd"
                                                        />
                                                    </g>
                                                </svg>
                                            </div>
                                            <p
                                                className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#b44734] text-[10px] md:text-[12px] text-center text-nowrap hidden sm:block"
                                                dir="auto">
                                                فهد عبدالله
                                            </p>
                                            <div className="overflow-clip relative shrink-0 size-[28px]">
                                                <Image
                                                    src="/svgs/user-4-line.svg"
                                                    alt="User"
                                                    fill
                                                    className="brightness-0 saturate-100"
                                                    style={{
                                                        filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Cart Icon */}
                                        <div className="overflow-clip relative shrink-0 size-[28px] cursor-pointer">
                                            <Image
                                                src="/svgs/shopping-cart-2-line.svg"
                                                alt="Cart"
                                                fill
                                                className="brightness-0 invert"
                                            />
                                            <div className="absolute bg-[#f3c450] bottom-px content-stretch flex flex-col items-center justify-center overflow-clip p-[2px] rounded-[8px] left-[18px] min-w-[16px] h-[16px]">
                                                <p className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center text-nowrap">
                                                    5
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notification Icon */}
                                        <div className="overflow-clip relative shrink-0 size-[28px] cursor-pointer">
                                            <Image
                                                src="/svgs/notification-line.svg"
                                                alt="Notifications"
                                                fill
                                                className="brightness-0 invert"
                                            />
                                            <div className="absolute bg-[#f3c450] bottom-px content-stretch flex flex-col items-center justify-center overflow-clip p-[2px] rounded-[8px] left-[42px] min-w-[16px] h-[16px]">
                                                <p className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center text-nowrap">
                                                    5
                                                </p>
                                            </div>
                                        </div>

                                        {/* Language/Globe Icon */}
                                        <div className="overflow-clip relative shrink-0 size-[28px] cursor-pointer">
                                            <Image
                                                src="/svgs/earth-2-line.svg"
                                                alt="Language"
                                                fill
                                                className="brightness-0 invert"
                                            />
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full max-w-[356px] hidden lg:flex">
                                        <div className="bg-white h-[50px] min-h-[50px] relative rounded-[16px] shrink-0 w-full border-[#b8c2cc] border-[0.5px] border-solid">
                                            <div className="flex flex-row items-center justify-center min-h-[inherit] overflow-clip rounded-[inherit] size-full">
                                                <div className="content-stretch flex gap-[8px] items-center justify-center min-h-[inherit] px-[16px] py-[8px] relative size-full">
                                                    <Image
                                                        src="/svgs/search-line.svg"
                                                        alt="Search"
                                                        width={24}
                                                        height={24}
                                                        className="opacity-40 grayscale"
                                                    />
                                                    <p
                                                        className="basis-0 font-['IBM_Plex_Sans_Arabic',sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#8795a0] text-[16px] text-right"
                                                        dir="auto">
                                                        اكتب شيء للبحث عنه ...
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Nav tabs: طلباتي، العروض، الفروع، الأقسام، الرئيسية */}
                                <div className="content-stretch flex gap-[2px] items-center relative shrink-0 hidden md:flex">
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] md:text-[14px] text-center text-nowrap text-white"
                                            dir="auto">
                                            طلباتي
                                        </p>
                                        <Image
                                            src="/svgs/shopping-bag-2-line.svg"
                                            alt="Orders"
                                            width={24}
                                            height={24}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white"
                                            dir="auto">
                                            العروض
                                        </p>
                                        <Image
                                            src="/svgs/mdi-discount-circle-outline.svg"
                                            alt="Offers"
                                            width={24}
                                            height={24}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white"
                                            dir="auto">
                                            الفروع
                                        </p>
                                        <Image
                                            src="/svgs/building-5-line.svg"
                                            alt="Branches"
                                            width={24}
                                            height={24}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white"
                                            dir="auto">
                                            الأقسام
                                        </p>
                                        <Image
                                            src="/svgs/grid-line.svg"
                                            alt="Categories"
                                            width={24}
                                            height={24}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="bg-white content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 shadow-lg">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#b44734] font-black text-[14px] text-center text-nowrap"
                                            dir="auto">
                                            الرئيسية
                                        </p>
                                        <Image
                                            src="/svgs/home-4-line.svg"
                                            alt="Home"
                                            width={24}
                                            height={24}
                                            style={{
                                                filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right Logo */}
                                <div
                                    className="content-stretch flex gap-2 md:gap-[8px] items-center justify-end relative shrink-0"
                                    data-name="logo">
                                    <p
                                        className="font-black italic leading-[normal] not-italic relative shrink-0 text-[#f3c450] text-[20px] md:text-[24px] lg:text-[28px] text-center text-nowrap"
                                        dir="auto">
                                        Fasto
                                    </p>
                                    <div className="h-[31px] relative shrink-0 w-[27px] bg-[#f3c450]/10 p-1.5 rounded-lg border border-[#f3c450]/20">
                                        <Image
                                            src="/svgs/logo-1.svg"
                                            alt="Fasto"
                                            fill
                                            className="p-1"
                                            style={{
                                                filter: 'invert(87%) sepia(21%) saturate(1476%) hue-rotate(356deg) brightness(97%) contrast(92%)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-header: Order type and Branch */}
                    <div className="relative shrink-0 w-full">
                        <div className="flex flex-col items-end justify-center size-full">
                            <div className="content-stretch flex flex-col items-end justify-center pb-0 pt-[16px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 relative w-full">
                                <div className="relative shrink-0 w-full bg-white rounded-tl-[16px] rounded-tr-[16px]">
                                    <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                                        <div className="content-stretch flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-[12px] relative w-full gap-4">
                                            {/* Order Types */}
                                            <div className="content-stretch flex gap-4 md:gap-6 items-center relative shrink-0 flex-wrap md:flex-nowrap">
                                                <div className="content-stretch flex gap-2 items-center relative shrink-0 w-full md:w-auto flex-wrap">
                                                    <button className="basis-0 bg-[#f0f3f6] grow min-h-px min-w-px relative rounded-[8px] shrink-0 border-[#dae1e9] border-[0.5px] border-solid px-3 py-2 text-sm text-[#b44734] font-bold">
                                                        ناول داخل الفرع
                                                    </button>
                                                    <button className="basis-0 bg-[#f0f3f6] grow min-h-px min-w-px relative rounded-[8px] shrink-0 border-[#dae1e9] border-[0.5px] border-solid px-3 py-2 text-sm text-[#b44734] font-bold">
                                                        استلام من الفرع
                                                    </button>
                                                    <button className="basis-0 bg-[#b44734] grow min-h-px min-w-px relative rounded-[8px] shrink-0 border-[#dae1e9] border-[0.5px] border-solid px-3 py-2 text-sm text-white font-bold">
                                                        توصيل إلى موقعي
                                                    </button>
                                                </div>
                                                <p
                                                    className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] font-black text-[14px] md:text-[16px] text-nowrap text-right"
                                                    dir="auto">
                                                    حدد نوع الطلب:
                                                </p>
                                            </div>

                                            {/* Branch Selection */}
                                            <div className="content-stretch flex gap-2 md:gap-[8px] items-center justify-end relative shrink-0 group cursor-pointer">
                                                <div className="content-stretch flex items-center relative shrink-0 gap-2">
                                                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                    <p
                                                        className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] font-black text-[14px] md:text-[16px] text-nowrap text-right"
                                                        dir="auto">
                                                        فرع النخيل
                                                    </p>
                                                </div>
                                                <div className="bg-white relative rounded-[48px] shrink-0 size-[28px] border-[#dae1e9] border-[0.5px] border-solid p-1 shadow-sm">
                                                    <Image
                                                        src="/svgs/building-5-line.svg"
                                                        alt="Branch"
                                                        fill
                                                        className="p-1 opacity-60"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- HERO BANNER --- */}
                <div className="relative shrink-0 w-full z-[7]">
                    <div className="overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex flex-col items-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-8 md:py-[32px] relative w-full">
                            <div className="h-[200px] sm:h-[300px] md:h-[385px] lg:h-[450px] relative rounded-[24px] shrink-0 w-full shadow-2xl overflow-hidden group">
                                <Image
                                    src="/svgs/hero.svg"
                                    alt="Super Delicious Burger"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="flex flex-col items-center justify-end size-full relative z-10">
                                    <div className="content-stretch flex flex-col items-center justify-end p-[8px] relative size-full">
                                        <div
                                            className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full"
                                            data-name="dots">
                                            <div className="relative shrink-0 size-[5px] rounded-full bg-white/40"></div>
                                            <div className="relative shrink-0 size-[5px] rounded-full bg-white/40"></div>
                                            <div className="relative shrink-0 size-[5px] rounded-full bg-white/40"></div>
                                            <div className="relative shrink-0 size-[5px] rounded-full bg-white/40"></div>
                                            <div className="relative shrink-0 size-[8px] rounded-full bg-[#F3C450] shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CATEGORIES --- */}
                <div className="relative shrink-0 w-full z-[6] mb-12">
                    <div className="flex flex-row items-center justify-center size-full">
                        <div className="content-stretch flex gap-6 md:gap-10 items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-0 relative w-full overflow-x-auto scrollbar-hide">
                            <div className="content-stretch flex flex-col items-center px-2 md:px-[8px] py-3 md:py-[12px] relative rounded-[15px] shrink-0 min-w-[80px] group cursor-pointer border-[#dae1e9] border-[1.25px] border-solid hover:border-primary transition-all">
                                <div className="content-stretch flex flex-col items-center justify-center p-[7.143px] relative shrink-0 size-[62.5px] group-hover:-translate-y-1 transition-transform">
                                    <Image
                                        src="/svgs/image-21.png"
                                        alt="Burger"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                    />
                                </div>
                                <p className="font-black text-[#121212] text-[14px] md:text-[16px] text-nowrap text-right mt-2 group-hover:text-primary transition-colors">
                                    برجر
                                </p>
                            </div>

                            <div className="content-stretch flex flex-col items-center px-2 md:px-[8px] py-3 md:py-[12px] relative rounded-[15px] shrink-0 min-w-[80px] group cursor-pointer border-[#dae1e9] border-[1.25px] border-solid hover:border-primary transition-all">
                                <div className="content-stretch flex flex-col items-center justify-center p-[7.143px] relative shrink-0 size-[62.5px] group-hover:-translate-y-1 transition-transform">
                                    <Image
                                        src="/svgs/image-19.png"
                                        alt="Meals"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                    />
                                </div>
                                <p className="font-black text-[#121212] text-[14px] md:text-[16px] text-nowrap text-right mt-2 group-hover:text-primary transition-colors">
                                    وجبات
                                </p>
                            </div>

                            <div className="content-stretch flex flex-col items-center px-2 md:px-[8px] py-3 md:py-[12px] relative rounded-[15px] shrink-0 min-w-[80px] group cursor-pointer border-[#dae1e9] border-[1.25px] border-solid hover:border-primary transition-all">
                                <div className="content-stretch flex flex-col items-center justify-center p-[7.143px] relative shrink-0 size-[62.5px] group-hover:-translate-y-1 transition-transform">
                                    <Image
                                        src="/svgs/image-20-2.png"
                                        alt="Drinks"
                                        width={45}
                                        height={45}
                                        className="object-contain"
                                    />
                                </div>
                                <p className="font-black text-[#121212] text-[14px] md:text-[16px] text-nowrap text-right mt-2 group-hover:text-primary transition-colors">
                                    المشروبات
                                </p>
                            </div>

                            <div className="content-stretch flex flex-col items-center px-2 md:px-[8px] py-3 md:py-[12px] relative rounded-[15px] shrink-0 min-w-[80px] group cursor-pointer border-[#dae1e9] border-[1.25px] border-solid hover:border-primary transition-all">
                                <div className="content-stretch flex flex-col items-center justify-center p-[7.143px] relative shrink-0 size-[62.5px] group-hover:-translate-y-1 transition-transform">
                                    <Image
                                        src="/svgs/image-23.png"
                                        alt="Desserts"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                    />
                                </div>
                                <p className="font-black text-[#121212] text-[14px] md:text-[16px] text-nowrap text-right mt-2 group-hover:text-primary transition-colors">
                                    الحلويات
                                </p>
                            </div>

                            <div className="content-stretch flex flex-col items-center px-2 md:px-[8px] py-3 md:py-[12px] relative rounded-[15px] shrink-0 min-w-[80px] group cursor-pointer border-primary border-[1.25px] border-solid shadow-xl shadow-primary/10">
                                <div className="content-stretch flex flex-col items-center justify-center p-[7.143px] relative shrink-0 size-[62.5px] scale-110">
                                    <Image
                                        src="/svgs/image-20-1.png"
                                        alt="Pizza"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                    />
                                </div>
                                <p className="font-black text-primary text-[14px] md:text-[16px] text-nowrap text-right mt-2">
                                    البيتزا
                                </p>
                            </div>

                            <div className="content-stretch flex flex-col items-center px-2 md:px-[8px] py-3 md:py-[12px] relative rounded-[15px] shrink-0 min-w-[80px] group cursor-pointer border-[#dae1e9] border-[1.25px] border-solid hover:border-primary transition-all">
                                <div className="content-stretch flex flex-col items-center justify-center p-[7.143px] relative shrink-0 size-[62.5px] group-hover:-translate-y-1 transition-transform">
                                    <Image
                                        src="/svgs/grid-line.svg"
                                        alt="All"
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                        style={{
                                            filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                        }}
                                    />
                                </div>
                                <p className="font-black text-[#121212] text-[14px] md:text-[16px] text-nowrap text-right mt-2 group-hover:text-primary transition-colors">
                                    الأقسام
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PRODUCT SECTIONS --- */}
                <div className="relative shrink-0 w-full z-[5] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 mb-20 space-y-24">
                    {/* العروض */}
                    <div className="content-stretch flex flex-col gap-[32px] items-end relative w-full">
                        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                            <div className="bg-[#f0f3f6] content-stretch flex items-center justify-center px-3 md:px-[12px] py-2 md:py-[8px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-gray-200 transition-colors">
                                <p className="font-black text-[#b44734] text-[14px] md:text-[16px] text-nowrap text-right">
                                    المزيد
                                </p>
                            </div>
                            <p className="font-black text-[#121212] text-[18px] md:text-[20px] lg:text-[24px] text-nowrap text-right border-r-4 border-primary pr-4 inline-block">
                                العروض
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white content-stretch flex flex-col gap-[16px] items-end pb-[12px] pt-[16px] px-[12px] relative rounded-[20px] shrink-0 w-full border-[#dae1e9] border-[1.25px] border-solid hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                                    {/* Product Image */}
                                    <div className="aspect-[1.1] relative shrink-0 w-full bg-[#FAFAFA] rounded-2xl overflow-hidden">
                                        <Image
                                            alt="Food"
                                            fill
                                            className="object-contain p-4 group-hover:rotate-3 group-hover:scale-110 transition-transform duration-500"
                                            src="/svgs/dish-4-29.png"
                                        />
                                        {/* Favorite Button */}
                                        <div className="absolute bg-white flex flex-col items-start justify-center left-[10px] p-[6px] rounded-[10px] top-[10px] border-[#dae1e9] border-[0.667px] border-solid shadow-sm cursor-pointer hover:bg-primary hover:text-white group/heart transition-colors">
                                            <Image
                                                src="/svgs/heart-line.svg"
                                                alt="Fav"
                                                width={18}
                                                height={18}
                                                className="group-hover/heart:brightness-0 group-hover/heart:invert"
                                            />
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <div className="content-stretch flex flex-col gap-[4px] items-end relative shrink-0 w-full">
                                        <p
                                            className="font-black text-[#3e4852] text-[14px] md:text-[16px] text-nowrap text-right"
                                            dir="auto">
                                            اسم الطبق
                                        </p>
                                        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                                            <p
                                                className="font-bold text-[#dc3030] text-[12px] md:text-[14px] text-center text-nowrap"
                                                dir="auto">
                                                وفر 5%
                                            </p>
                                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                                                <p
                                                    className="line-through decoration-solid text-[#616f7c] text-[12px] md:text-[14px] font-medium"
                                                    dir="auto">
                                                    250
                                                </p>
                                                <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0">
                                                    <Image
                                                        src="/svgs/riyal-1.svg"
                                                        alt="SAR"
                                                        width={14}
                                                        height={14}
                                                        className="opacity-70"
                                                    />
                                                    <p
                                                        className="font-black text-[#121212] text-[16px] md:text-[18px] text-center text-nowrap"
                                                        dir="auto">
                                                        230
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Add Button */}
                                    <button className="bg-[rgba(180,71,52,0.1)] relative rounded-[12px] shrink-0 w-full border-[#b44734] border-[1.25px] border-solid py-3 flex items-center justify-center gap-3 text-[#b44734] font-black hover:bg-primary hover:text-white transition-all active:scale-95 group/add">
                                        <span>اضافة إلى السلة</span>
                                        <Image
                                            src="/svgs/shopping-cart-2-line.svg"
                                            alt="Add"
                                            width={20}
                                            height={20}
                                            className="brightness-0 saturate-100 group-hover/add:brightness-0 group-hover/add:invert transition-all"
                                            style={{
                                                filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                            }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* جديدنا & الاكثر طلباً would follow same structure... */}
                </div>

                {/* --- FOOTER --- */}
                <footer
                    className="w-full flex flex-col items-center relative overflow-clip border-t mt-20"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, rgba(180, 71, 52, 0.05) 0%, rgba(180, 71, 52, 0.05) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
                    }}>
                    <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-16 flex flex-wrap gap-12 lg:gap-20 justify-end">
                        {/* Apps */}
                        <div className="flex flex-col items-end gap-6 min-w-[200px]">
                            <p className="font-black text-[#121212] text-xl">
                                حمل التطبيق
                            </p>
                            <div className="flex flex-col gap-4">
                                <Image
                                    src="/svgs/frame-217.svg"
                                    alt="App Store"
                                    width={162}
                                    height={48}
                                    className="cursor-pointer"
                                />
                                <Image
                                    src="/svgs/frame-218.svg"
                                    alt="Google Play"
                                    width={162}
                                    height={48}
                                    className="cursor-pointer"
                                />
                                <Image
                                    src="/svgs/frame-218.svg"
                                    alt="App Gallery"
                                    width={162}
                                    height={48}
                                    className="cursor-pointer opacity-50 grayscale"
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col items-end gap-6 min-w-[200px]">
                            <p className="font-black text-[#121212] text-xl">
                                تواصل معنا
                            </p>
                            <div className="flex flex-col gap-6 items-end">
                                <div className="flex items-center gap-4 group cursor-pointer hover:bg-white rounded-2xl p-2 transition-colors">
                                    <p className="font-bold text-gray-700">
                                        +966 55 123 9876
                                    </p>
                                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                                        <Image
                                            src="/svgs/phone-line.svg"
                                            alt="Tel"
                                            width={22}
                                            height={22}
                                            className="brightness-0 saturate-100"
                                            style={{
                                                filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer hover:bg-white rounded-2xl p-2 transition-colors">
                                    <p className="font-bold text-gray-700">
                                        contact@Fasto.sa
                                    </p>
                                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                                        <Image
                                            src="/svgs/mail-line.svg"
                                            alt="Mail"
                                            width={22}
                                            height={22}
                                            className="brightness-0 saturate-100"
                                            style={{
                                                filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex flex-col items-end gap-6 min-w-[150px]">
                            <p className="font-black text-[#121212] text-xl">
                                عن فاستو
                            </p>
                            <div className="flex flex-col items-end gap-3 text-gray-500 font-bold">
                                <Link
                                    href="#"
                                    className="hover:text-primary hover:-translate-x-2 transition-all">
                                    اتصل بنا
                                </Link>
                                <Link
                                    href="#"
                                    className="hover:text-primary hover:-translate-x-2 transition-all">
                                    الاسئلة الشائعة
                                </Link>
                                <Link
                                    href="#"
                                    className="hover:text-primary hover:-translate-x-2 transition-all">
                                    الشروط والاحكام
                                </Link>
                            </div>
                        </div>

                        {/* Logo / About */}
                        <div className="flex flex-col items-end gap-6 max-w-sm flex-1">
                            <div className="flex flex-col items-end gap-2 group cursor-pointer">
                                <div className="bg-primary p-4 rounded-[2rem] shadow-xl rotate-0 group-hover:rotate-12 transition-transform duration-500">
                                    <Image
                                        src="/svgs/logo-1.svg"
                                        alt="Fasto"
                                        width={48}
                                        height={48}
                                        className="brightness-0 invert"
                                    />
                                </div>
                                <p className="text-4xl font-black italic text-primary mt-2">
                                    Fasto
                                </p>
                            </div>
                            <p className="text-sm font-bold text-gray-400 text-right leading-loose">
                                نقدّم في مطعمنا تجربة طعام تجمع بين الجودة
                                العالية والطعم المميز، باستخدام أفضل المكونات
                                الطازجة وإشراف فريق متخصص لضمان أعلى معايير
                                النظافة والجودة.
                            </p>
                        </div>
                    </div>

                    {/* Payments Bar */}
                    <div className="bg-primary w-full py-10 relative mt-10">
                        <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 flex flex-col items-center gap-12">
                            {/* Icons Box */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[3rem] shadow-2xl flex flex-wrap items-center justify-center gap-8 px-12">
                                <Image
                                    src="/svgs/mada.svg"
                                    alt="Mada"
                                    width={54}
                                    height={34}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                />
                                <Image
                                    src="/svgs/visa.svg"
                                    alt="Visa"
                                    width={54}
                                    height={34}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                />
                                <Image
                                    src="/svgs/apple-pay.svg"
                                    alt="Apple"
                                    width={54}
                                    height={34}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                />
                                <Image
                                    src="/svgs/stc-pay-01-2.svg"
                                    alt="STC"
                                    width={54}
                                    height={34}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                />
                                <Image
                                    src="/svgs/tabby.svg"
                                    alt="Tabby"
                                    width={54}
                                    height={34}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                />
                                <Image
                                    src="/svgs/tamara.svg"
                                    alt="Tamara"
                                    width={54}
                                    height={34}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                />
                            </div>

                            <div className="w-full flex flex-col md:flex-row items-center justify-between text-white/50 text-[13px] font-bold border-t border-white/10 pt-10 gap-8">
                                <div className="flex items-center gap-6">
                                    <Social icon="/svgs/twitter.svg" />
                                    <Social icon="/svgs/instagram.svg" />
                                    <Social icon="/svgs/snapchat.svg" />
                                    <Social icon="/svgs/tiktok.svg" />
                                </div>
                                <p className="order-3 md:order-2">
                                    جميع الحقوق محفوظة © 2025
                                </p>
                                <div className="flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full border border-white/20 order-2 md:order-3">
                                    <span className="opacity-60 text-xs">
                                        يعمل بواسطة
                                    </span>
                                    <span className="text-white text-lg italic font-black">
                                        Libro
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Floating buttons */}
                <div className="fixed left-8 bottom-8 z-[100] flex flex-col gap-6">
                    <button className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-4 ring-white shadow-[#25D366]/40">
                        <Image
                            src="/svgs/whatsapp-white.svg"
                            alt="WA"
                            width={36}
                            height={36}
                        />
                    </button>
                    <button className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white ring-4 ring-white">
                        <div className="font-black text-white text-2xl italic">
                            !
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Inline Social Utility
function Social({ icon }: { icon: string }) {
    return (
        <Link
            href="#"
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:scale-110 transition-all group/soc">
            <Image
                src={icon}
                alt="Social"
                width={18}
                height={18}
                className="brightness-0 invert group-hover/soc:invert-0 transition-all"
            />
        </Link>
    );
}
