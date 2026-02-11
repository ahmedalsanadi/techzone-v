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
        <div className="hidden lg:flex w-2/5 flex-col items-center justify-center p-12 text-white relative bg-theme-primary">
            <div className="relative z-10 flex flex-col items-center px-4">
                <div className="mb-8">
                    <Image
                        src={config.store.logo_url}
                        alt={config.store.name}
                        width={160}
                        height={160}
                        className="size-40 object-contain"
                    />
                </div>
                <h1
                    className="text-6xl 2xl:text-7xl font-black tracking-tighter text-center wrap-break-word"
                    style={{ color: secondaryColor }}>
                    {config.store.name}
                </h1>
            </div>
        </div>
    );
}
