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
        <div className="flex min-h-screen">
            <div className="w-full lg:w-3/5 bg-white flex flex-col p-4 sm:py-8 relative">
                <AuthHeader title={title} onBack={onBack} />

                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center lg:-mt-16">
                    {children}
                </div>

                <AuthFooter locale={locale} />
            </div>

            <BrandingSide config={config} />
        </div>
    );
}