'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StoreConfig } from '@/services/types';
import AuthContainer from '@/components/auth/AuthContainer';
import { useRouter } from '@/i18n/navigation';
import PhoneInput from '@/components/ui/PhoneInput';
import OtpStep from '@/components/ui/OtpStep';
import { useAuthStore } from '@/store/useAuthStore';
import { formatMaskedPhone } from '@/lib/auth/utils';
import { useAuthFlowState } from '@/hooks/auth/useAuthFlowState';
import { useOtpTimer } from '@/hooks/auth/useOtpTimer';
import { useAuthFlowValidation } from '@/hooks/auth/useAuthFlowValidation';
import { useAuthFlowHandlers } from '@/hooks/auth/useAuthFlowHandlers';
import { useAuthProfileLoader } from '@/hooks/auth/useAuthProfileLoader';

// Common Input styling - shared across all auth inputs (responsive)
const AUTH_INPUT_COMMON_CONTAINER =
    '!w-full !h-10 sm:!h-12 md:!h-14 !px-3 sm:!px-4 md:!px-5 !rounded-lg sm:!rounded-xl md:!rounded-2xl !bg-[#F4F7FA] !border-[#E2E8F0] focus-within:!border-theme-primary-border focus-within:!ring-2 sm:focus-within:!ring-3 md:focus-within:!ring-4 focus-within:!ring-theme-primary/5';

const AUTH_INPUT_COMMON_TEXT =
    '!font-bold !text-sm sm:!text-base md:!text-lg text-start placeholder:!text-gray-400';

// Input-specific text color (can be overridden per input if needed)
const AUTH_INPUT_TEXT_COLOR = 'text-[#2D3142]!';

interface AuthFlowProps {
    config: StoreConfig;
    locale: string;
    initialStep?: string;
    redirectTo?: string;
}

export default function AuthFlow({
    config,
    locale,
    initialStep,
    redirectTo,
}: AuthFlowProps) {
    const t = useTranslations('Auth');
    const router = useRouter();
    const {
        user,
        token,
        isAuthenticated,
        checkProfileComplete,
    } = useAuthStore();

    // Manage auth flow state
    const {
        step,
        setStep,
        loading,
        setLoading,
        isNewUser,
        setIsNewUser,
        phone,
        setPhone,
        tempToken,
        setTempToken,
        maskedPhone,
        setMaskedPhone,
        otpExpiresAt,
        setOtpExpiresAt,
        otp,
        setOtp,
        formData,
        setFormData,
    } = useAuthFlowState({
        initialStep,
        isAuthenticated,
        checkProfileComplete,
        userEmail: user?.email || null,
    });

    // OTP timer
    const timer = useOtpTimer(step, otpExpiresAt, setOtpExpiresAt);

    // Validate flow and handle redirects
    useAuthFlowValidation({
        step,
        setStep,
        isAuthenticated,
        isNewUser,
        phone,
        checkProfileComplete,
        redirectTo,
    });

    // Load profile if needed
    useAuthProfileLoader({
        step,
        isAuthenticated,
        isNewUser,
        token,
        checkProfileComplete,
        setFormData,
        redirectTo,
    });

    // Auth flow handlers
    const {
        handlePhoneSubmit,
        handleOtpSubmit,
        handleSignupSubmit,
        handleBack,
        handleResendOtp,
    } = useAuthFlowHandlers({
        step,
        setStep,
        loading,
        setLoading,
        isNewUser,
        setIsNewUser,
        phone,
        setPhone,
        tempToken,
        setTempToken,
        maskedPhone,
        setMaskedPhone,
        otpExpiresAt,
        setOtpExpiresAt,
        otp,
        setOtp,
        formData,
        setFormData,
        redirectTo,
        isAuthenticated,
    });

    // Render based on current step
    if (step === 'phone') {
        return (
            <AuthContainer
                config={config}
                locale={locale}
                title={t('phoneTitle') || 'تسجيل الدخول'}
                onBack={undefined}>
                <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={handlePhoneSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
                        <PhoneInput
                            label={t('phone') || 'رقم الهاتف'}
                            value={phone}
                            onChange={setPhone}
                            required
                            inputClassName="bg-[#F4F7FA]"
                        />

                        <div className="text-xs sm:text-sm text-[#2D3142] text-start px-1">
                            {t('termsText')}{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/terms')}
                                className="text-theme-primary font-bold hover:underline wrap-break-word">
                                {t('termsLink')}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !phone}
                            className="w-full h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl text-white font-black text-sm sm:text-base md:text-lg lg:text-xl shadow-xl transition-all active:scale-[0.98] mt-3 sm:mt-4 md:mt-5 bg-theme-primary hover:brightness-[0.95] shadow-theme-primary/20">
                            {loading ? (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                t('sendOtp') || 'إرسال رمز التحقق'
                            )}
                        </Button>
                    </form>
                </div>
            </AuthContainer>
        );
    }

    if (step === 'otp') {
        return (
            <AuthContainer
                config={config}
                locale={locale}
                title={t('otpTitle') || 'تأكيد رقم الهاتف'}
                onBack={handleBack}>
                <OtpStep
                    otp={otp}
                    onOtpChange={setOtp}
                    onSubmit={handleOtpSubmit}
                    onResend={handleResendOtp}
                    maskedPhone={maskedPhone || formatMaskedPhone(phone)}
                    subtitle={t('otpSubtitle') || 'أدخل رمز التحقق المرسل إلى'}
                    continueLabel={t('continue') || 'متابعة'}
                    resendLabel={t('resend') || 'إعادة الإرسال'}
                    timer={timer}
                    loading={loading}
                />
            </AuthContainer>
        );
    }

    // Signup step
    return (
        <AuthContainer
            config={config}
            locale={locale}
            title={t('signupTitle') || 'إكمال الملف الشخصي'}
            onBack={isAuthenticated ? undefined : handleBack}>
            <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-[#2D3142] text-start px-1 mb-2 sm:mb-3 md:mb-4">
                    {t('signupSubtitle') || 'أكمل بياناتك الشخصية للمتابعة'}
                </p>

                <form onSubmit={handleSignupSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                        <label className="text-xs font-bold text-gray-400 block text-start">
                            {t('firstName') || 'الاسم الأول'} *
                        </label>
                        <Input
                            type="text"
                            required
                            placeholder={t('firstNamePlaceholder') || 'Ahmed'}
                            value={formData.first_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    first_name: e.target.value,
                                })
                            }
                            variant="filled"
                            inputSize="lg"
                            containerClassName={AUTH_INPUT_COMMON_CONTAINER}
                            className={`${AUTH_INPUT_COMMON_TEXT} ${AUTH_INPUT_TEXT_COLOR}`}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('middleName') || 'اسم الأب'}
                            </label>
                            <Input
                                type="text"
                                placeholder={t('middleNamePlaceholder') || 'Mohammed'}
                                value={formData.middle_name || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        middle_name: e.target.value,
                                    })
                                }
                                variant="filled"
                                inputSize="lg"
                            containerClassName={AUTH_INPUT_COMMON_CONTAINER}
                            className={`${AUTH_INPUT_COMMON_TEXT} ${AUTH_INPUT_TEXT_COLOR}`}
                            />
                        </div>
                        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('lastName') || 'اللقب'}
                            </label>
                            <Input
                                type="text"
                                placeholder={t('lastNamePlaceholder') || 'Al-Sanadi'}
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        last_name: e.target.value,
                                    })
                                }
                                variant="filled"
                                inputSize="lg"
                            containerClassName={AUTH_INPUT_COMMON_CONTAINER}
                            className={`${AUTH_INPUT_COMMON_TEXT} ${AUTH_INPUT_TEXT_COLOR}`}
                            />
                        </div>
                    </div>

                    <PhoneInput
                        label={t('phone') || 'رقم الهاتف'}
                        value={phone}
                        onChange={() => {}}
                        required
                        disabled
                        inputClassName="bg-gray-100 text-gray-400"
                    />

                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                        <label className="text-xs font-bold text-gray-400 block text-start">
                            {t('email') || 'البريد الإلكتروني'}
                        </label>
                        <Input
                            type="email"
                            placeholder="someone@gmail.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            variant="filled"
                            inputSize="lg"
                            containerClassName={AUTH_INPUT_COMMON_CONTAINER}
                            className={`${AUTH_INPUT_COMMON_TEXT} ${AUTH_INPUT_TEXT_COLOR}`}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !formData.first_name.trim()}
                        className="w-full h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl text-white font-black text-sm sm:text-base md:text-lg lg:text-xl shadow-xl transition-all active:scale-[0.98] mt-3 sm:mt-4 md:mt-5 bg-libero-red shadow-libero-red/20">
                        {loading ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('completeProfile') || 'إكمال الملف الشخصي'
                        )}
                    </Button>
                </form>
            </div>
        </AuthContainer>
    );
}
