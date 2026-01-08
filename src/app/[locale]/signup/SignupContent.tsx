'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { StoreConfig } from '@/services/types';

interface SignupContentProps {
    config: StoreConfig;
    locale: string;
}

export default function SignupContent({ config, locale }: SignupContentProps) {
    const t = useTranslations('Signup');
    const isArabic = locale === 'ar';
    const [step, setStep] = useState<'register' | 'otp'>('register');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
    });

    const primaryColor = config.theme.primary_color || '#B44734';
    const secondaryColor = config.theme.secondary_color || '#FFC107';

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('otp');
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Frontend only logic as requested
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div
                className="hidden lg:flex w-[40%] flex-col items-center justify-center p-12 text-white relative overflow-hidden"
                style={{ backgroundColor: primaryColor }}>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8">
                        <Image
                            src={config.store.logo_url}
                            alt={config.store.name}
                            width={160}
                            height={160}
                            className="object-contain"
                        />
                    </div>
                    <h1
                        className="text-7xl font-black tracking-tighter"
                        style={{ color: secondaryColor }}>
                        {config.store.name}
                    </h1>
                </div>
                {/* Decorative elements to match image bubbles */}
                <div
                    className="absolute top-24 left-24 w-40 h-40 rounded-full border-16 opacity-20"
                    style={{ borderColor: secondaryColor }}
                />
                <div
                    className="absolute bottom-32 right-24 w-24 h-24 rounded-full opacity-10"
                    style={{ backgroundColor: secondaryColor }}
                />
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-[60%] bg-white flex flex-col p-6 md:p-12 lg:p-16 relative">
                {/* Header with Back Button */}
                <div
                    className={cn(
                        'flex items-center mb-12',
                        isArabic ? 'flex-row-reverse' : 'flex-row',
                    )}>
                    <button
                        onClick={() =>
                            step === 'otp'
                                ? setStep('register')
                                : window.history.back()
                        }
                        className="flex items-center gap-6 group">
                        <h1 className="text-3xl font-black text-[#2D3142] leading-none pt-2">
                            {step === 'register' ? t('title') : t('otpTitle')}
                        </h1>
                        <div className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center transition-all bg-white shadow-sm group-hover:bg-gray-50">
                            {isArabic ? (
                                <ChevronRight
                                    size={32}
                                    className="text-gray-400"
                                />
                            ) : (
                                <ChevronLeft
                                    size={32}
                                    className="text-gray-400"
                                />
                            )}
                        </div>
                    </button>
                </div>

                {/* Form Content */}
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center -mt-24">
                    {step === 'register' ? (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p
                                className={cn(
                                    'text-xl font-black text-[#2D3142]',
                                    isArabic ? 'text-end' : 'text-start',
                                )}>
                                {t('subtitle')}
                            </p>

                            <form
                                onSubmit={handleRegisterSubmit}
                                className="space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label
                                        className={cn(
                                            'text-xs font-bold text-gray-400 block',
                                            isArabic
                                                ? 'text-end'
                                                : 'text-start',
                                        )}>
                                        {t('name')}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="محمد عبدالله"
                                        className={cn(
                                            'w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142]',
                                            isArabic
                                                ? 'text-end'
                                                : 'text-start',
                                        )}
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-2">
                                    <label
                                        className={cn(
                                            'text-xs font-bold text-gray-400 block',
                                            isArabic
                                                ? 'text-end'
                                                : 'text-start',
                                        )}>
                                        {t('phone')}{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div
                                            className={cn(
                                                'absolute top-1/2 -translate-y-1/2 flex items-center gap-3 px-4 h-10',
                                                isArabic
                                                    ? 'right-0 flex-row-reverse'
                                                    : 'left-0',
                                            )}>
                                            <div className="w-8 h-5 relative rounded-sm overflow-hidden shadow-sm border border-gray-100">
                                                <img
                                                    src="https://flagcdn.com/w40/sa.png"
                                                    alt="SA"
                                                    className="w-full h-full object-cover"
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
                                            className={cn(
                                                'w-full h-16 rounded-2xl bg-[#DCE2E9] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-gray-500',
                                                isArabic
                                                    ? 'pr-36 text-end'
                                                    : 'pl-36 text-start',
                                            )}
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

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label
                                        className={cn(
                                            'text-xs font-bold text-gray-400 block',
                                            isArabic
                                                ? 'text-end'
                                                : 'text-start',
                                        )}>
                                        {t('email')}
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="someone@gmail.com"
                                        className={cn(
                                            'w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142]',
                                            isArabic
                                                ? 'text-end'
                                                : 'text-start',
                                        )}
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] mt-6"
                                    style={{
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 12px 24px -8px ${primaryColor}88`,
                                    }}>
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
                                    +96655471****
                                </p>
                            </div>

                            <form
                                onSubmit={handleOtpSubmit}
                                className="space-y-12">
                                {/* OTP Code Inputs */}
                                <div className="flex justify-between gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength={1}
                                            placeholder="-"
                                            className="w-20 h-20 text-center text-3xl font-black rounded-2xl bg-white border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all shadow-sm text-gray-400 placeholder:text-gray-300"
                                        />
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <Button
                                        type="submit"
                                        className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98]"
                                        style={{
                                            backgroundColor: primaryColor,
                                            boxShadow: `0 12px 24px -8px ${primaryColor}88`,
                                        }}>
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
                </div>

                {/* Footer Logo */}
                <div className="mt-auto flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-lg font-bold">
                            {t('poweredBy')}
                        </span>
                        <Image
                            src="/images/logo/libero-copywrite.svg"
                            alt="Libro"
                            width={80}
                            height={28}
                            className="grayscale opacity-60"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
