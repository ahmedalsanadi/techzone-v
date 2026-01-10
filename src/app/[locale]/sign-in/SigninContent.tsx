'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { StoreConfig } from '@/services/types';
import AuthContainer from '@/components/auth/AuthContainer';
import { useRouter } from '@/i18n/navigation';
import PhoneInput from '@/components/ui/PhoneInput';
import OtpStep from '@/components/ui/OtpStep';

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
    const [otp, setOtp] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
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
            title={step === 'login' ? t('title') : t('otpTitle')}
            onBack={step === 'otp' ? () => setStep('login') : undefined}>
            {step === 'login' ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <PhoneInput
                            label={t('phone')}
                            value={formData.phone}
                            onChange={(value) =>
                                setFormData({ ...formData, phone: value })
                            }
                            required
                            inputClassName="bg-[#F4F7FA]"
                        />

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
