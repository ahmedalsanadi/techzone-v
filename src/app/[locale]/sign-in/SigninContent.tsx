'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { StoreConfig } from '@/services/types';
import AuthContainer from '@/components/auth/AuthContainer';
import { useRouter } from '@/i18n/navigation';

interface SigninContentProps {
    config: StoreConfig;
    locale: string;
}

export default function SigninContent({ config, locale }: SigninContentProps) {
    const t = useTranslations('Signin');
    const router = useRouter();
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [formData, setFormData] = useState({
        phone: '',
    });
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('otp');
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Frontend only logic as requested
    };

    // Auto-focus first OTP input when OTP step is shown
    useEffect(() => {
        if (step === 'otp' && otpRefs.current[0]) {
            otpRefs.current[0]?.focus();
        }
    }, [step]);

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next field if value is entered
        if (value && index < 3) {
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
            const newOtp = [...otp];
            digits.slice(0, 4).forEach((digit, idx) => {
                if (idx < 4) {
                    newOtp[idx] = digit;
                }
            });
            setOtp(newOtp);

            // Focus the next empty field or the last field
            const nextEmptyIndex = newOtp.findIndex((val) => !val);
            const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
            otpRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <AuthContainer
            config={config}
            locale={locale}
            title={step === 'login' ? t('title') : t('otpTitle')}
            onBack={step === 'otp' ? () => setStep('login') : undefined}>
            {step === 'login' ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        {/* Phone Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('phone')}
                            </label>
                            <div className="relative group">
                                <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-3 px-4 h-10 start-0">
                                    <div className="w-8 h-5 relative rounded-sm overflow-hidden shadow-sm border border-gray-100">
                                        <Image
                                            src="https://flagcdn.com/w40/sa.png"
                                            alt="SA"
                                            width={32}
                                            height={20}
                                            className="object-cover"
                                        />
                                    </div>
                                    <span
                                        className="text-[#2D3142] font-black text-lg"
                                        dir="ltr">
                                        +966
                                    </span>
                                </div>
                                <input
                                    type="tel"
                                    required
                                    placeholder="50 123 4567"
                                    className="w-full h-16 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start ps-36"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="text-sm text-[#2D3142] text-start">
                            {t('termsText')}{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/terms')}
                                className="text-libero-red font-bold hover:underline">
                                {t('termsLink')}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] mt-6 bg-libero-red shadow-libero-red/20">
                            {t('submit')}
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center space-y-4">
                        <p className="text-xl font-bold text-[#2D3142] opacity-80">
                            {t('otpSubtitle')}
                        </p>
                        <p
                            className="text-2xl font-black text-[#2D3142]"
                            dir="ltr">
                            +966{formData.phone.replace(/\d(?=\d{4})/g, '*')}
                        </p>
                    </div>

                    <form onSubmit={handleOtpSubmit} className="space-y-12">
                        {/* OTP Code Inputs */}
                        <div className="flex justify-between gap-4">
                            {[0, 1, 2, 3].map((index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        otpRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    placeholder="-"
                                    value={otp[index]}
                                    onChange={(e) =>
                                        handleOtpChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        handleOtpKeyDown(index, e)
                                    }
                                    onPaste={handleOtpPaste}
                                    className="w-20 h-20 text-center text-3xl font-black rounded-2xl bg-white border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all shadow-sm text-gray-400 placeholder:text-gray-300"
                                />
                            ))}
                        </div>

                        <div className="space-y-6">
                            <Button
                                type="submit"
                                className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] bg-libero-red">
                                {t('continue')}
                            </Button>

                            <div className="flex items-center justify-between h-18 px-8 rounded-2xl bg-[#FDF2F2]">
                                <span
                                    className="text-[#B44734] font-black text-2xl"
                                    dir="ltr">
                                    00:30
                                </span>
                                <button
                                    type="button"
                                    className="text-[#B44734] font-black text-2xl opacity-60 hover:opacity-100 transition-opacity">
                                    {t('resend')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </AuthContainer>
    );
}
