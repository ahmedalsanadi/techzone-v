'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/services/types';

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
    const primaryColor = config.theme.primary_color || '#B44734';
    const secondaryColor = config.theme.secondary_color || '#FFC107';

    return (
        <div className="flex min-h-screen">
            {/* Left Side -Content Container  */}
            <div className="w-full lg:w-[60%] bg-white flex flex-col p-6 md:p-12 lg:p-16 relative">
                {/* Header with Back Button */}
                <div className="flex items-center mb-12">
                    <button
                        onClick={onBack || (() => window.history.back())}
                        className="flex items-center gap-6 group">
                       
                        <div className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center transition-all bg-white shadow-sm group-hover:bg-gray-50">
                           
                                <ChevronLeft
                                    size={28}
                                    className="text-gray-400 rtl:rotate-180"
                                />
                        </div>
                         <h1 className="text-3xl font-black text-[#2D3142] leading-none pt-2">
                            {title}
                        </h1>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center -mt-24">
                    {children}
                </div>

                {/* Footer Branding */}
                <div className="mt-auto flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-lg font-bold">
                            {isArabic ? 'يعمل بواسطة' : 'Powered by'}
                        </span>
                        <Image
                            src="/images/logo/libro-copywrite-dark.svg"
                            alt="Libro"
                            width={80}
                            height={28}
                            className="grayscale opacity-60"
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div
                className="hidden lg:flex w-[40%] flex-col items-center justify-center p-12 text-white relative overflow-hidden bg-libero-red"
                // style={{ backgroundColor: primaryColor }} 
                >
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8">
                        <Image
                            src={config.store.logo_url}
                            alt={config.store.name}
                            width={160}
                            height={160}
                            className="object-contain"
                        />
                    </div>
                    <h1
                        className="text-7xl font-black tracking-tighter"
                        style={{ color: secondaryColor }}>
                        {config.store.name}
                    </h1>
                </div>

            </div>
        </div>
    );
}
