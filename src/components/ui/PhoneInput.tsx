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
    disabled?: boolean;
    error?: string;
    /** Unique id for the input; enables label htmlFor and autofill. */
    id?: string;
    /** Form field name for submission/autofill (e.g. "phone"). */
    name?: string;
    /** Autocomplete hint (default "tel" when not disabled). */
    autoComplete?: string;
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
    disabled = false,
    error,
    id,
    name = 'phone',
    autoComplete,
}: PhoneInputProps) {
    const inputId = id ?? (label ? `phone-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    return (
        <div className={cn('space-y-1 sm:space-y-1.5 md:space-y-2', className)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-bold text-gray-400 block text-start">
                    {label}
                    {showRequiredIndicator && (
                        <span className="text-red-500"> *</span>
                    )}
                </label>
            )}
            <div className="relative group" dir="ltr">
                <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-2.5 md:gap-3 px-2 sm:px-3 md:px-4 h-10 sm:h-12 md:h-14 start-0">
                    <div className="w-6 h-4 sm:w-7 sm:h-4.5 md:w-8 md:h-5 relative rounded-sm overflow-hidden shadow-sm border border-gray-100 shrink-0">
                        <Image
                            src={flagUrl}
                            alt="Country Flag"
                            width={32}
                            height={20}
                            className="object-cover w-full h-full"
                            unoptimized
                        />
                    </div>
                    <span className="text-[#2D3142] font-black text-sm sm:text-base md:text-lg shrink-0">
                        {countryCode}
                    </span>
                </div>
                <input
                    id={inputId}
                    name={name}
                    type="tel"
                    required={required}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete={autoComplete ?? (disabled ? undefined : 'tel')}
                    className={cn(
                        'w-full h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl border border-[#E2E8F0] focus:border-theme-primary-border focus:ring-2 sm:focus:ring-3 md:focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all font-bold text-sm sm:text-base md:text-lg text-[#2D3142] text-start ps-24 sm:ps-28 md:ps-36',
                        disabled ? 'opacity-50 cursor-not-allowed' : '',
                        error ? 'border-red-500 ring-red-500/10' : '',
                        inputClassName,
                    )}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            {error && (
                <span className="text-xs text-red-500 font-medium px-1 block text-start">
                    {error}
                </span>
            )}
        </div>
    );
}
