'use client';

import React from 'react';
import { StoreConfig } from '@/types/store';
import AuthHeader from './AuthHeader';
import AuthFooter from './AuthFooter';
import BrandingSide from './BrandingSide';

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
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <div className="w-full lg:w-3/5 bg-white flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 relative shadow-2xl lg:shadow-none z-10 animate-in fade-in slide-in-from-left-4 duration-700">
                <AuthHeader title={title} onBack={onBack} />

                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center lg:-mt-20">
                    {children}
                </div>

                <AuthFooter locale={locale} />
            </div>

            <BrandingSide config={config} />
        </div>
    );
}
