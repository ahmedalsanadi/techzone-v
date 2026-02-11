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
        <div className="flex justify-start items-center mb-8 lg:mb-12">
            <Button
                type="button"
                variant="ghost"
                onClick={onBack || (() => window.history.back())}
                className="flex justify-start items-center gap-4 group w-full p-0 h-auto border-0 bg-transparent hover:bg-transparent shadow-none">
                <div className="size-12 md:size-14 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm group-hover:bg-gray-50 shrink-0">
                    <ChevronLeft
                        className="size-6 md:size-7 text-gray-400 rtl:rotate-180"
                    />
                </div>
                <h1 className="font-bold text-[#2D3142] truncate">{title}</h1>
            </Button>
        </div>
    );
}
