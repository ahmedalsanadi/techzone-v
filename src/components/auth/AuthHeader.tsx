'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuthHeaderProps {
    title: string;
    onBack?: () => void;
}

export default function AuthHeader({ title, onBack }: AuthHeaderProps) {
    return (
        <div className="flex justify-start items-center mb-10 lg:mb-16 px-2 sm:px-4">
            <Button
                type="button"
                variant="ghost"
                onClick={onBack || (() => window.history.back())}
                className="flex justify-start items-center gap-4 group w-full p-0 h-auto border-0 bg-transparent hover:bg-transparent shadow-none active:scale-[0.98] transition-transform">
                <div className="size-10 md:size-12 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md group-hover:border-theme-primary/20 transition-all shrink-0">
                    <ChevronLeft className="size-5 md:size-6 text-gray-500 group-hover:text-theme-primary rtl:rotate-180 transition-colors" />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[#2D3142] truncate tracking-tight">
                    {title}
                </h1>
            </Button>
        </div>
    );
}
