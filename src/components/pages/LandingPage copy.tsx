'use client';

import Image from 'next/image';
import Link from 'next/link';

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
                                        <div className="bg-white content-stretch flex gap-[4px] items-center justify-end p-[4px] relative rounded-[32px] shrink-0 border border-black/5 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                                            <Image
                                                src="/svgs/down-small-line.svg"
                                                alt="v"
                                                width={16}
                                                height={16}
                                                className="ml-1 opacity-60"
                                            />
                                            <p
                                                className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#b44734] font-bold text-[10px] md:text-[12px] text-center text-nowrap hidden sm:block"
                                                dir="auto">
                                                فهد عبدالله
                                            </p>
                                            <div className="overflow-clip relative shrink-0 size-[28px] bg-primary/10 rounded-full flex items-center justify-center">
                                                <Image
                                                    src="/svgs/user-4-line.svg"
                                                    alt="User"
                                                    width={20}
                                                    height={20}
                                                    className="brightness-0 saturate-100"
                                                    style={{
                                                        filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Cart Icon */}
                                        <div className="overflow-clip relative shrink-0 size-[28px] cursor-pointer group">
                                            <Image
                                                src="/svgs/shopping-cart-2-line.svg"
                                                alt="Cart"
                                                fill
                                                className="brightness-0 invert group-hover:scale-110 transition-transform"
                                            />
                                            <div className="absolute bg-[#f3c450] bottom-px content-stretch flex flex-col items-center justify-center overflow-clip p-[2px] rounded-[8px] left-[18px] min-w-[16px] h-[16px] border border-primary/20">
                                                <p className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[10px] text-black font-black text-center text-nowrap">
                                                    5
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notification Icon */}
                                        <div className="overflow-clip relative shrink-0 size-[28px] cursor-pointer group">
                                            <Image
                                                src="/svgs/notification-line.svg"
                                                alt="Notifications"
                                                fill
                                                className="brightness-0 invert group-hover:scale-110 transition-transform"
                                            />
                                            <div className="absolute bg-[#f3c450] bottom-px content-stretch flex flex-col items-center justify-center overflow-clip p-[2px] rounded-[8px] left-[18px] min-w-[16px] h-[16px] border border-primary/20">
                                                <p className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[10px] text-black font-black text-center text-nowrap">
                                                    5
                                                </p>
                                            </div>
                                        </div>

                                        {/* Language/Globe Icon */}
                                        <div className="overflow-clip relative shrink-0 size-[28px] cursor-pointer group">
                                            <Image
                                                src="/svgs/earth-2-line.svg"
                                                alt="Language"
                                                fill
                                                className="brightness-0 invert group-hover:scale-110 transition-transform"
                                            />
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full max-w-[356px] hidden lg:flex">
                                        <div className="bg-white h-[50px] min-h-[50px] relative rounded-[16px] shrink-0 w-full border-[#b8c2cc] border-[0.5px] border-solid shadow-inner">
                                            <div className="flex flex-row items-center justify-center min-h-[inherit] overflow-clip rounded-[inherit] size-full">
                                                <div className="content-stretch flex gap-[8px] items-center justify-center min-h-[inherit] px-[16px] py-[8px] relative size-full">
                                                    <Image
                                                        src="/svgs/search-line.svg"
                                                        alt="Search"
                                                        width={24}
                                                        height={24}
                                                        className="opacity-30 grayscale"
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

                                {/* Center Nav tabs */}
                                <div className="content-stretch flex gap-[2px] items-center relative shrink-0 hidden md:flex">
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10 transition-colors group">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] md:text-[14px] text-center text-nowrap text-white group-hover:font-bold"
                                            dir="auto">
                                            طلباتي
                                        </p>
                                        <Image
                                            src="/svgs/shopping-bag-2-line.svg"
                                            alt="Orders"
                                            width={20}
                                            height={20}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10 transition-colors group">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white group-hover:font-bold"
                                            dir="auto">
                                            العروض
                                        </p>
                                        <Image
                                            src="/svgs/mdi-discount-circle-outline.svg"
                                            alt="Offers"
                                            width={20}
                                            height={20}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10 transition-colors group">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white group-hover:font-bold"
                                            dir="auto">
                                            الفروع
                                        </p>
                                        <Image
                                            src="/svgs/building-5-line.svg"
                                            alt="Branches"
                                            width={20}
                                            height={20}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-white/10 transition-colors group">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white group-hover:font-bold"
                                            dir="auto">
                                            الأقسام
                                        </p>
                                        <Image
                                            src="/svgs/grid-line.svg"
                                            alt="Categories"
                                            width={20}
                                            height={20}
                                            className="brightness-0 invert"
                                        />
                                    </div>
                                    <div className="bg-white content-stretch flex gap-[8px] items-center justify-center p-[8px] px-4 relative rounded-[12px] shrink-0 shadow-xl border border-white/20">
                                        <p
                                            className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#b44734] font-black text-[14px] text-center text-nowrap"
                                            dir="auto">
                                            الرئيسية
                                        </p>
                                        <Image
                                            src="/svgs/home-4-line.svg"
                                            alt="Home"
                                            width={20}
                                            height={20}
                                            style={{
                                                filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right Logo */}
                                <div
                                    className="content-stretch flex gap-2 md:gap-[8px] items-center justify-end relative shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                    data-name="logo">
                                    <p
                                        className="font-black italic leading-[normal] not-italic relative shrink-0 text-[#f3c450] text-[20px] md:text-[24px] lg:text-[28px] text-center text-nowrap"
                                        dir="auto">
                                        Fasto
                                    </p>
                                    <div className="h-[31px] relative shrink-0 w-[27px] bg-[#f3c450]/10 p-1.5 rounded-lg border border-[#f3c450]/20 flex items-center justify-center shadow-lg shadow-[#f3c450]/5">
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
                    <div className="relative shrink-0 w-full shadow-sm">
                        <div className="flex flex-col items-end justify-center size-full">
                            <div className="content-stretch flex flex-col items-end justify-center pb-0 pt-[16px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-32 relative w-full">
                                <div className="relative shrink-0 w-full bg-white rounded-tl-[16px] rounded-tr-[16px] border-b border-gray-50">
                                    <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                                        <div className="content-stretch flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-[10px] relative w-full gap-4">
                                            {/* Order Types */}
                                            <div className="content-stretch flex gap-4 md:gap-6 items-center relative shrink-0 flex-wrap md:flex-nowrap">
                                                <div className="content-stretch flex gap-2 items-center relative shrink-0 w-full md:w-auto flex-wrap">
                                                    <button className="basis-0 bg-[#f0f3f6] grow min-h-px min-w-px relative rounded-[8px] shrink-0 border-[#dae1e9] border-[0.5px] border-solid px-4 py-2 text-[12px] md:text-sm text-[#b44734] font-bold hover:bg-gray-100 transition-colors">
                                                        تناول داخل الفرع
                                                    </button>
                                                    <button className="basis-0 bg-[#f0f3f6] grow min-h-px min-w-px relative rounded-[8px] shrink-0 border-[#dae1e9] border-[0.5px] border-solid px-4 py-2 text-[12px] md:text-sm text-[#b44734] font-bold hover:bg-gray-100 transition-colors">
                                                        استلام من الفرع
                                                    </button>
                                                    <button className="basis-0 bg-[#b44734] grow min-h-px min-w-px relative rounded-[8px] shrink-0 border-[#b44734] border-[0.5px] border-solid px-4 py-2 text-[12px] md:text-sm text-white font-bold shadow-md active:scale-95 transition-all">
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
                                                <div className="content-stretch flex items-center relative shrink-0 gap-2 group-hover:translate-x-[-2px] transition-transform">
                                                    <Image
                                                        src="/svgs/down-small-line.svg"
                                                        alt="v"
                                                        width={14}
                                                        height={14}
                                                        className="opacity-40"
                                                    />
                                                    <p
                                                        className="font-['IBM_Plex_Sans_Arabic',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] font-black text-[14px] md:text-[16px] text-nowrap text-right"
                                                        dir="auto">
                                                        فرع النخيل
                                                    </p>
                                                </div>
                                                <div className="bg-white relative rounded-full shrink-0 size-[32px] border-[#dae1e9] border-[0.5px] border-solid p-1.5 shadow-sm group-hover:shadow-md transition-all">
                                                    <Image
                                                        src="/svgs/building-5-line.svg"
                                                        alt="Branch"
                                                        fill
                                                        className="p-1.5 opacity-60"
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
                        <div className="content-stretch flex flex-col items-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-6 md:py-[24px] relative w-full">
                            <div className="h-[200px] sm:h-[300px] md:h-[385px] lg:h-[450px] relative rounded-[32px] shrink-0 w-full shadow-2xl overflow-hidden group border border-gray-100">
                                <Image
                                    src="/svgs/hero.svg"
                                    alt="Super Delicious Burger"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                    priority
                                />
                                <div className="flex flex-col items-center justify-end size-full relative z-10">
                                    <div className="content-stretch flex flex-col items-center justify-end p-[16px] relative size-full">
                                        <div
                                            className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full"
                                            data-name="dots">
                                            {/* Actual dots are within hero.svg as circles, but to match interaction: */}
                                            <div className="relative shrink-0 size-[6px] rounded-full bg-white/40 hover:bg-white cursor-pointer transition-colors"></div>
                                            <div className="relative shrink-0 size-[6px] rounded-full bg-white/40 hover:bg-white cursor-pointer transition-colors"></div>
                                            <div className="relative shrink-0 size-[6px] rounded-full bg-white/40 hover:bg-white cursor-pointer transition-colors"></div>
                                            <div className="relative shrink-0 size-[6px] rounded-full bg-white/40 hover:bg-white cursor-pointer transition-colors"></div>
                                            <div className="relative shrink-0 size-[10px] rounded-full bg-[#F3C450] shadow-glow ring-4 ring-[#F3C450]/20"></div>
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
                        <div className="content-stretch flex gap-3 md:gap-4 items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-0 relative w-full overflow-x-auto scrollbar-hide">
                            {/* Order from screenshot */}
                            <CategoryCard
                                img="/svgs/image-21.png"
                                label="برجر"
                            />
                            <CategoryCard
                                img="/svgs/image-19.png"
                                label="وجبات"
                            />
                            <CategoryCard
                                img="/svgs/image-19.png"
                                label="وجبات"
                            />
                            <CategoryCard
                                img="/svgs/image-20-2.png"
                                label="المشروبات"
                            />
                            <CategoryCard
                                img="/svgs/image-17.png"
                                label="الحلويات"
                            />
                            <CategoryCard
                                img="/svgs/image-21.png"
                                label="برجر"
                            />
                            <CategoryCard
                                img="/svgs/image-20-1.png"
                                label="البيتزا"
                                active
                            />
                            <CategoryCard
                                img="/svgs/grid-line.svg"
                                label="الأقسام"
                                isSvg
                            />
                        </div>
                    </div>
                </div>

                {/* --- PRODUCT SECTIONS --- */}
                <div className="relative shrink-0 w-full z-[5] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 mb-20 space-y-24">
                    {/* العروض */}
                    <div className="content-stretch flex flex-col gap-[20px] items-end relative w-full">
                        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full gap-4">
                            <div className="bg-[#f0f3f6] content-stretch flex items-center justify-center px-4 py-2 relative rounded-[10px] shrink-0 cursor-pointer hover:bg-gray-200 transition-all active:scale-95 border border-gray-100">
                                <p className="font-bold text-[#b44734] text-[14px] md:text-[16px] text-nowrap text-right">
                                    المزيد
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="font-black text-[#121212] text-[22px] md:text-[26px] text-nowrap text-right">
                                    العروض
                                </p>
                                <div className="h-8 w-1.5 bg-[#b44734] rounded-full"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white content-stretch flex flex-col gap-[16px] items-end pb-[16px] pt-[20px] px-[16px] relative rounded-[24px] shrink-0 w-full border-[#dae1e9] border-[1.25px] border-solid hover:shadow-2xl hover:shadow-primary/10 transition-all group cursor-pointer">
                                    {/* Product Image */}
                                    <div className="aspect-[1.1] relative shrink-0 w-full bg-[#FDFDFD] rounded-2xl overflow-hidden">
                                        <Image
                                            alt="Food"
                                            fill
                                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out"
                                            src="/svgs/dish-4-29.png"
                                        />
                                        {/* Favorite Button */}
                                        <div className="absolute bg-white/80 backdrop-blur-sm flex flex-col items-start justify-center left-[12px] p-[8px] rounded-[12px] top-[12px] border-[#dae1e9] border-[1px] border-solid shadow-sm cursor-pointer hover:bg-[#b44734] hover:text-white transition-all group/heart z-10">
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
                                    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0 w-full">
                                        <p
                                            className="font-bold text-[#3e4852] text-[15px] md:text-[17px] text-nowrap text-right group-hover:text-primary transition-colors"
                                            dir="auto">
                                            اسم الطبق
                                        </p>
                                        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                                            <p
                                                className="font-bold text-[#dc3030] text-[12px] md:text-[14px] text-center text-nowrap bg-red-50 px-2 py-0.5 rounded-full"
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
                                                        className="opacity-80"
                                                    />
                                                    <p
                                                        className="font-black text-[#121212] text-[18px] md:text-[20px] text-center text-nowrap"
                                                        dir="auto">
                                                        230
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Add Button */}
                                    <div className="bg-[rgba(180,71,52,0.08)] relative rounded-[14px] shrink-0 w-full border-[#b44734]/20 border-[1px] border-solid py-3.5 flex items-center justify-center gap-3 text-[#b44734] font-black hover:bg-[#b44734] hover:text-white transition-all active:scale-[0.98] group/add cursor-pointer shadow-sm">
                                        <p className="text-[14px] md:text-[16px]">
                                            اضافة إلى السلة
                                        </p>
                                        <Image
                                            src="/svgs/shopping-cart-2-line.svg"
                                            alt="Add"
                                            width={22}
                                            height={22}
                                            className="brightness-0 saturate-100 group-hover/add:brightness-0 group-hover/add:invert transition-all"
                                            style={{
                                                filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <footer
                    className="w-full flex flex-col items-center relative overflow-clip border-t mt-20"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, rgba(180, 71, 52, 0.04) 0%, rgba(180, 71, 52, 0.04) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
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
                                    className="cursor-pointer hover:scale-105 transition-transform"
                                />
                                <Image
                                    src="/svgs/frame-218.svg"
                                    alt="Google Play"
                                    width={162}
                                    height={48}
                                    className="cursor-pointer hover:scale-105 transition-transform"
                                />
                                <Image
                                    src="/svgs/frame-218.svg"
                                    alt="App Gallery"
                                    width={162}
                                    height={48}
                                    className="cursor-pointer opacity-30 grayscale hover:grayscale-0 transition-all"
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col items-end gap-6 min-w-[200px]">
                            <p className="font-black text-[#121212] text-xl">
                                تواصل معنا
                            </p>
                            <div className="flex flex-col gap-6 items-end">
                                <div className="flex items-center gap-4 group cursor-pointer hover:translate-x-[-4px] transition-all">
                                    <p className="font-bold text-gray-700 group-hover:text-primary transition-colors">
                                        +966 55 123 9876
                                    </p>
                                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 group-hover:bg-primary transition-colorsShadow-lg">
                                        <Image
                                            src="/svgs/phone-line.svg"
                                            alt="Tel"
                                            width={22}
                                            height={22}
                                            className="brightness-0 saturate-100 group-hover:invert group-hover:brightness-0 transition-all"
                                            style={{
                                                filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer hover:translate-x-[-4px] transition-all">
                                    <p className="font-bold text-gray-700 group-hover:text-primary transition-colors">
                                        contact@Fasto.sa
                                    </p>
                                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 group-hover:bg-primary transition-colorsShadow-lg">
                                        <Image
                                            src="/svgs/mail-line.svg"
                                            alt="Mail"
                                            width={22}
                                            height={22}
                                            className="brightness-0 saturate-100 group-hover:invert group-hover:brightness-0 transition-all"
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
                            <div className="flex flex-col items-end gap-4 text-gray-500 font-bold">
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
                        <div className="flex flex-col items-end gap-6 max-w-md flex-1">
                            <div className="flex flex-col items-end gap-2 group cursor-pointer">
                                <div className="bg-primary p-4 rounded-[1.8rem] shadow-2xl rotate-0 group-hover:rotate-12 transition-transform duration-700">
                                    <Image
                                        src="/svgs/logo-1.svg"
                                        alt="Fasto"
                                        width={48}
                                        height={48}
                                        className="brightness-0 invert shadow-inner"
                                    />
                                </div>
                                <p className="text-4xl font-black italic text-primary mt-2 flex items-center gap-2">
                                    Fasto
                                </p>
                            </div>
                            <p className="text-base font-bold text-gray-400 text-right leading-relaxed">
                                نقدّم في مطعمنا تجربة طعام تجمع بين الجودة
                                العالية والطعم المميز، باستخدام أفضل المكونات
                                الطازجة وإشراف فريق متخصص لضمان أعلى معايير
                                النظافة والجودة.
                            </p>
                        </div>
                    </div>

                    {/* Payments Bar */}
                    <div className="bg-[#b44734] w-full py-12 relative">
                        <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 flex flex-col items-center gap-14">
                            {/* Icons Box */}
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.8rem] shadow-2xl flex flex-wrap items-center justify-center gap-10 px-14">
                                <Image
                                    src="/svgs/stc-pay-01-2.svg"
                                    alt="STC"
                                    width={64}
                                    height={40}
                                    className="hover:scale-125 transition-transform cursor-pointer brightness-0 invert"
                                />
                                <Image
                                    src="/svgs/stc-pay-01-1.svg"
                                    alt="Mada"
                                    width={64}
                                    height={40}
                                    className="hover:scale-125 transition-transform cursor-pointer brightness-0 invert"
                                />
                                <Image
                                    src="/svgs/stc-pay-01-2.svg"
                                    alt="Visa"
                                    width={64}
                                    height={40}
                                    className="hover:scale-125 transition-transform cursor-pointer brightness-0 invert"
                                />
                                <Image
                                    src="/svgs/stc-pay-01-1.svg"
                                    alt="Apple"
                                    width={64}
                                    height={40}
                                    className="hover:scale-125 transition-transform cursor-pointer brightness-0 invert"
                                />
                                <Image
                                    src="/svgs/stc-pay-01-2.svg"
                                    alt="Tabby"
                                    width={64}
                                    height={40}
                                    className="hover:scale-125 transition-transform cursor-pointer brightness-0 invert"
                                />
                            </div>

                            <div className="w-full flex flex-col md:flex-row items-center justify-between text-white/40 text-[14px] font-bold border-t border-white/5 pt-12 gap-8">
                                <div className="flex items-center gap-8">
                                    <Social icon="/svgs/notification-line.svg" />{' '}
                                    {/* Replace with actual social SVGs if available */}
                                    <Social icon="/svgs/earth-2-line.svg" />
                                    <Social icon="/svgs/user-4-line.svg" />
                                </div>
                                <p className="order-3 md:order-2 tracking-wide">
                                    جميع الحقوق محفوظة © 2025
                                </p>
                                <div className="flex items-center gap-3 bg-white/5 px-8 py-2.5 rounded-full border border-white/10 order-2 md:order-3 hover:bg-white/10 transition-colors cursor-default">
                                    <span className="opacity-50 text-xs">
                                        يعمل بواسطة
                                    </span>
                                    <span className="text-white text-xl italic font-black tracking-tighter">
                                        Libro
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#f3c450]/20"></div>
                    </div>
                </footer>

                {/* Floating buttons */}
                <div className="fixed left-8 bottom-8 z-[100] flex flex-col gap-6">
                    <button className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-4 ring-white shadow-[#25D366]/40">
                        <Image
                            src="/svgs/shopping-cart-2-line.svg"
                            alt="WA"
                            width={36}
                            height={36}
                            className="brightness-0 invert"
                        />{' '}
                        {/* Replace with actual whatsapp if found */}
                    </button>
                    <button className="w-16 h-16 bg-[#b44734] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white">
                        <div className="font-black text-[#f3c450] text-3xl italic">
                            ?
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Internal Helper for Categories
function CategoryCard({
    img,
    label,
    isSvg,
    active,
}: {
    img: string;
    label: string;
    isSvg?: boolean;
    active?: boolean;
}) {
    return (
        <div
            className={`content-stretch flex flex-col items-center px-4 py-4 md:py-[18px] relative rounded-[20px] shrink-0 min-w-[100px] group cursor-pointer transition-all duration-500 border-[1.5px] border-solid ${
                active
                    ? 'border-primary bg-white shadow-2xl shadow-primary/10 scale-110 z-10'
                    : 'border-[#dae1e9] bg-[#FDFDFD] hover:border-primary/40 hover:-translate-y-2'
            }`}>
            <div
                className={`content-stretch flex flex-col items-center justify-center p-[8px] relative shrink-0 size-[70px] transition-transform duration-500 ${
                    active
                        ? 'scale-110'
                        : 'group-hover:scale-110 rotate-0 group-hover:rotate-6'
                }`}>
                {isSvg ? (
                    <Image
                        src={img}
                        alt={label}
                        width={40}
                        height={40}
                        className="object-contain"
                        style={{
                            filter: 'invert(32%) sepia(34%) saturate(1476%) hue-rotate(326deg) brightness(89%) contrast(88%)',
                        }}
                    />
                ) : (
                    <Image
                        src={img}
                        alt={label}
                        width={60}
                        height={60}
                        className="object-contain drop-shadow-lg"
                    />
                )}
            </div>
            <p
                className={`font-black text-[15px] md:text-[17px] text-nowrap text-center mt-3 transition-colors ${
                    active
                        ? 'text-primary'
                        : 'text-[#121212] group-hover:text-primary'
                }`}>
                {label}
            </p>
        </div>
    );
}

// Inline Social Utility
function Social({ icon }: { icon: string }) {
    return (
        <Link
            href="#"
            className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white hover:scale-110 transition-all group/soc shadow-lg">
            <Image
                src={icon}
                alt="Social"
                width={22}
                height={22}
                className="brightness-0 invert group-hover/soc:invert-0 transition-all"
            />
        </Link>
    );
}
