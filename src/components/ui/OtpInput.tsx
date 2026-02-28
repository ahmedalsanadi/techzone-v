'use client';

import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
    length?: number;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    autoFocus?: boolean;
    /** Base for per-digit ids (e.g. "auth-otp" → auth-otp-0, auth-otp-1). Enables a11y and satisfies form field id requirement. */
    idBase?: string;
}

export default function OtpInput({
    length = 4,
    value: controlledValue,
    onChange,
    className = '',
    autoFocus = false,
    idBase = 'otp',
}: OtpInputProps) {
    const [internalOtp, setInternalOtp] = useState<string[]>(
        Array(length).fill(''),
    );
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Use controlled value if provided, otherwise use internal state
    const otp = controlledValue
        ? controlledValue.split('').slice(0, length)
        : internalOtp;
    const isControlled = controlledValue !== undefined;

    // Auto-focus first input when component mounts
    useEffect(() => {
        if (autoFocus && otpRefs.current[0]) {
            otpRefs.current[0]?.focus();
        }
    }, [autoFocus]);

    const handleOtpChange = (index: number, inputValue: string) => {
        // Only allow digits
        if (inputValue && !/^\d$/.test(inputValue)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = inputValue;
        const otpString = newOtp.join('');

        if (isControlled) {
            onChange?.(otpString);
        } else {
            setInternalOtp(newOtp);
            onChange?.(otpString);
        }

        // Move to next field if value is entered
        if (inputValue && index < length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const digits = pastedData.match(/\d/g) || [];

        if (digits.length > 0) {
            const newOtp = Array(length).fill('');
            digits.slice(0, length).forEach((digit, idx) => {
                if (idx < length) {
                    newOtp[idx] = digit;
                }
            });
            const otpString = newOtp.join('');

            if (isControlled) {
                onChange?.(otpString);
            } else {
                setInternalOtp(newOtp);
                onChange?.(otpString);
            }

            // Focus the next empty field or the last field
            const nextEmptyIndex = newOtp.findIndex((val) => !val);
            const focusIndex =
                nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
            otpRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className={`flex justify-between gap-2 sm:gap-3 md:gap-4 ${className}`}>
            {Array.from({ length }, (_, index) => (
                <input
                    key={index}
                    id={`${idBase}-${index}`}
                    name={`${idBase}-${index}`}
                    ref={(el) => {
                        otpRefs.current[index] = el;
                    }}
                    dir="ltr"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    placeholder="-"
                    value={otp[index] || ''}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${index + 1} of ${length}`}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-center text-xl sm:text-2xl md:text-3xl font-black rounded-lg sm:rounded-xl md:rounded-2xl bg-white border border-[#E2E8F0] focus:border-theme-primary-border focus:ring-2 sm:focus:ring-3 md:focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all shadow-sm text-gray-400 placeholder:text-gray-300"
                />
            ))}
        </div>
    );
}
