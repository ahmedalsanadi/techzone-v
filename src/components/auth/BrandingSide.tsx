'use client';

import React from 'react';
import Image from 'next/image';
import { StoreConfig } from '@/types/store';

interface BrandingSideProps {
    config: StoreConfig;
}

export default function BrandingSide({ config }: BrandingSideProps) {
    const secondaryColor = config.theme.secondary_color || '#FFC107';

    return (
        <div className="hidden lg:flex w-2/5 flex-col items-center justify-center p-12 text-white relative bg-theme-primary overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -ml-48 -mb-48 blur-3xl opacity-20" />

            <div className="relative z-10 flex flex-col items-center px-4">
                <div className="mb-10 p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-transform hover:scale-105 duration-500">
                    <Image
                        src={config.store.logo_url}
                        alt={config.store.name}
                        width={160}
                        height={160}
                        className="size-32 md:size-40 object-contain drop-shadow-2xl"
                        priority
                    />
                </div>
                <h1
                    className="text-5xl 2xl:text-7xl font-black tracking-tighter text-center wrap-break-word drop-shadow-lg"
                    style={{ color: secondaryColor }}>
                    {config.store.name}
                </h1>
                <div className="mt-4 h-1 w-24 rounded-full bg-white/20" />
            </div>
        </div>
    );
}
