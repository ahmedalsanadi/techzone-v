'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { StoreConfig } from '@/types/store';
import { Button } from '@/components/ui/Button';

interface AuthContainerProps {
    config: StoreConfig;
    locale: string;
    title: string;
    onBack?: () => void;
    children: React.ReactNode;
}

export default function AuthContainer({
    config,
    locale,
    title,
    onBack,
    children,
}: AuthContainerProps) {
    const isArabic = locale === 'ar';
    const secondaryColor = config.theme.secondary_color || '#FFC107';

    return (
        <div className="flex min-h-screen">
            {/* Left Side -Content Container  */}
            <div className="w-full lg:w-[60%] bg-white flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-x-hidden">
                {/* Header with Back Button */}
                <div className="flex items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onBack || (() => window.history.back())}
                        className="flex items-center gap-2 sm:gap-4 md:gap-6 group w-full min-w-0 h-auto min-h-0 p-0 rounded-none border-0 bg-transparent hover:bg-transparent shadow-none">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-gray-100 flex items-center justify-center transition-all bg-white shadow-sm group-hover:bg-gray-50 shrink-0">
                            <ChevronLeft
                                size={20}
                                className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-400 rtl:rotate-180"
                            />
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2D3142] leading-tight sm:leading-none pt-1 sm:pt-2 truncate min-w-0">
                            {title}
                        </h1>
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center mt-4 sm:mt-6 md:mt-8 lg:-mt-12 xl:-mt-16 pb-4 sm:pb-6 md:pb-8 min-h-0">
                    <div className="w-full overflow-y-auto">
                        {children}
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="mt-auto flex flex-col items-center gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                        <span className="text-gray-400 text-sm sm:text-base md:text-lg font-bold">
                            {isArabic ? 'يعمل بواسطة' : 'Powered by'}
                        </span>
                        <Image
                            src="/images/logo/libro-copywrite-dark.svg"
                            alt="Libro"
                            width={80}
                            height={28}
                            className="grayscale opacity-60 w-auto h-5 sm:h-6 md:h-7"
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div
                className="hidden lg:flex w-[40%] flex-col items-center justify-center p-8 xl:p-12 text-white relative overflow-hidden bg-theme-primary"
                >
                <div className="relative z-10 flex flex-col items-center max-w-full px-4">
                    <div className="mb-6 xl:mb-8">
                        <Image
                            src={config.store.logo_url}
                            alt={config.store.name}
                            width={160}
                            height={160}
                            className="object-contain w-32 h-32 xl:w-40 xl:h-40"
                        />
                    </div>
                    <h1
                        className="text-5xl xl:text-6xl 2xl:text-7xl font-black tracking-tighter wrap-break-word text-center"
                        style={{ color: secondaryColor }}>
                        {config.store.name}
                    </h1>
                </div>

            </div>
        </div>
    );
}
