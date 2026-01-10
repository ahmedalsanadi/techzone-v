'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    label?: string;
    showRequiredIndicator?: boolean;
    className?: string;
    inputClassName?: string;
    countryCode?: string;
    flagUrl?: string;
}

export default function PhoneInput({
    value,
    onChange,
    placeholder = '50 123 4567',
    required = false,
    label,
    showRequiredIndicator = false,
    className = '',
    inputClassName = '',
    countryCode = '+966',
    flagUrl = 'https://flagcdn.com/w40/sa.png',
}: PhoneInputProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <label className="text-xs font-bold text-gray-400 block text-start">
                    {label}
                    {showRequiredIndicator && (
                        <span className="text-red-500"> *</span>
                    )}
                </label>
            )}
            <div className="relative group">
                <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-3 px-4 h-10 start-0">
                    <div className="w-8 h-5 relative rounded-sm overflow-hidden shadow-sm border border-gray-100">
                        <Image
                            src={flagUrl}
                            alt="Country Flag"
                            width={32}
                            height={20}
                            className="object-cover"
                        />
                    </div>
                    <span
                        className="text-[#2D3142] font-black text-lg"
                        dir="ltr">
                        {countryCode}
                    </span>
                </div>
                <input
                    type="tel"
                    required={required}
                    placeholder={placeholder}
                    className={cn(
                        'w-full h-16 rounded-2xl border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start ps-36',
                        inputClassName,
                    )}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
