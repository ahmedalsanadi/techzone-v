'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { StoreConfig } from '@/services/types';
import AuthContainer from '@/components/auth/AuthContainer';
import PhoneInput from '@/components/ui/PhoneInput';
import OtpStep from '@/components/ui/OtpStep';

interface SignupContentProps {
    config: StoreConfig;
    locale: string;
}

export default function SignupContent({ config, locale }: SignupContentProps) {
    const t = useTranslations('Signup');
    const [step, setStep] = useState<'register' | 'otp'>('register');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
    });
    const [otp, setOtp] = useState('');

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('otp');
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Frontend only logic as requested
    };

    const maskedPhone = `+966${formData.phone.replace(/\d(?=\d{4})/g, '*')}`;

    return (
        <AuthContainer
            config={config}
            locale={locale}
            title={step === 'register' ? t('title') : t('otpTitle')}
            onBack={step === 'otp' ? () => setStep('register') : undefined}>
            {step === 'register' ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-xl font-black text-[#2D3142] text-start">
                        {t('subtitle')}
                    </p>

                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('name')}
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="محمد عبدالله"
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <PhoneInput
                            label={t('phone')}
                            value={formData.phone}
                            onChange={(value) =>
                                setFormData({ ...formData, phone: value })
                            }
                            required
                            showRequiredIndicator
                            inputClassName="bg-[#DCE2E9] text-gray-500"
                        />

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                placeholder="someone@gmail.com"
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
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
                            className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] mt-6 bg-libero-red shadow-libero-red/20"
                            // style={{
                            //     backgroundColor: primaryColor,
                            //     boxShadow: `0 12px 24px -8px ${primaryColor}88`,
                            // }}
                        >
                            {t('submit')}
                        </Button>
                    </form>
                </div>
            ) : (
                <OtpStep
                    otp={otp}
                    onOtpChange={setOtp}
                    onSubmit={handleOtpSubmit}
                    maskedPhone={maskedPhone}
                    subtitle={t('otpSubtitle')}
                    continueLabel={t('continue')}
                    resendLabel={t('resend')}
                    timer="00:30"
                />
            )}
        </AuthContainer>
    );
}
