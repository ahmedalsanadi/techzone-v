'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StoreConfig } from '@/types/store';
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
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { phoneSchema, otpSchema, profileSchema } from '@/lib/validations';

type ProfileFormValues = z.infer<typeof profileSchema>;

/** Get translated field error for auth forms; avoids repeating vt(errors.field?.message). */
function getFieldError<T extends string>(
    errors: FieldErrors,
    field: T,
    vt: (key: string) => string,
): string | undefined {
    const message = (errors as Record<string, { message?: string }>)[field]
        ?.message;
    return message ? vt(message) : undefined;
}

// Common Input styling - shared across all auth inputs (responsive)
const AUTH_INPUT_COMMON_CONTAINER =
    '!w-full !h-10 sm:!h-12 md:!h-14 !px-3 sm:!px-4 md:!px-5 !rounded-lg sm:!rounded-xl md:!rounded-2xl !bg-[#F4F7FA] !border-[#E2E8F0] focus-within:!border-theme-primary-border focus-within:!ring-2 sm:focus-within:!ring-3 md:focus-within:!ring-4 focus-within:!ring-theme-primary/5';

const AUTH_INPUT_COMMON_TEXT =
    '!font-bold !text-sm sm:!text-base md:!text-lg text-start placeholder:!text-gray-400';

// Input-specific text color (can be overridden per input if needed)
const AUTH_INPUT_TEXT_COLOR = 'text-[#2D3142]!';

// Shared props for signup form Inputs (DRY)
const AUTH_SIGNUP_INPUT_PROPS = {
    variant: 'filled' as const,
    inputSize: 'lg' as const,
    containerClassName: AUTH_INPUT_COMMON_CONTAINER,
    className: `${AUTH_INPUT_COMMON_TEXT} ${AUTH_INPUT_TEXT_COLOR}`,
};

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
    const vt = useTranslations('Validation');
    const router = useRouter();
    const { user, token, isAuthenticated, checkProfileComplete } =
        useAuthStore();

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
        handlePhoneSubmit: originalPhoneSubmit,
        handleOtpSubmit: originalOtpSubmit,
        handleSignupSubmit: originalSignupSubmit,
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

    // Forms (phone form uses values so we don't rely on watch() and avoid extra re-renders)
    const phoneForm = useForm({
        resolver: zodResolver(phoneSchema),
        values: { phone },
        mode: 'onChange',
    });

    const otpForm = useForm({
        resolver: zodResolver(otpSchema),
        values: { otp },
        mode: 'onChange',
    });

    const signupForm = useForm({
        resolver: zodResolver(profileSchema),
        values: {
            first_name: formData.first_name || '',
            middle_name: formData.middle_name || '',
            last_name: formData.last_name || '',
            email: formData.email || '',
        },
        mode: 'onChange',
    });

    const onPhoneSubmit = (data: { phone: string }) => {
        setPhone(data.phone);
        originalPhoneSubmit(data.phone);
    };

    const onOtpSubmit = (data: { otp: string }) => {
        setOtp(data.otp);
        originalOtpSubmit(data.otp);
    };

    const onSignupSubmit = (data: ProfileFormValues) => {
        setFormData((prev) => ({ ...prev, ...data }));
        originalSignupSubmit(data);
    };

    // Render based on current step
    if (step === 'phone') {
        return (
            <AuthContainer
                config={config}
                locale={locale}
                title={t('phoneTitle')}
                onBack={undefined}>
                <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form
                        onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                        className="space-y-3 sm:space-y-4 md:space-y-5">
                        <PhoneInput
                            id="auth-phone"
                            name="phone"
                            label={t('phone')}
                            value={phone}
                            onChange={(val) => {
                                setPhone(val);
                                phoneForm.setValue('phone', val, {
                                    shouldValidate: true,
                                });
                            }}
                            error={getFieldError(
                                phoneForm.formState.errors,
                                'phone',
                                vt,
                            )}
                            required
                            inputClassName="bg-[#F4F7FA]"
                        />

                        <div className="text-xs sm:text-sm text-[#2D3142] text-start px-1">
                            {t('termsText')}{' '}
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => router.push('/terms')}
                                className="text-theme-primary font-bold p-0 h-auto min-h-0">
                                {t('termsLink')}
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="xl"
                            disabled={loading || !phoneForm.formState.isValid}
                            className="w-full mt-3 sm:mt-4 md:mt-5 active:scale-[0.98]">
                            {loading ? (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                t('sendOtp')
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
                title={t('otpTitle')}
                onBack={handleBack}>
                <OtpStep
                    otp={otp}
                    onOtpChange={(val) => {
                        setOtp(val);
                        otpForm.setValue('otp', val);
                        if (val.length === 4) {
                            otpForm.handleSubmit(onOtpSubmit)();
                        }
                    }}
                    onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                    onResend={handleResendOtp}
                    maskedPhone={maskedPhone || formatMaskedPhone(phone)}
                    subtitle={t('otpSubtitle')}
                    continueLabel={t('continue')}
                    resendLabel={t('resend')}
                    timer={timer}
                    loading={loading}
                    error={getFieldError(
                        otpForm.formState.errors,
                        'otp',
                        vt,
                    )}
                    isValid={otpForm.formState.isValid}
                />
            </AuthContainer>
        );
    }

    // Signup step
    return (
        <AuthContainer
            config={config}
            locale={locale}
            title={t('signupTitle')}
            onBack={isAuthenticated ? undefined : handleBack}>
            <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-[#2D3142] text-start px-1 mb-2 sm:mb-3 md:mb-4">
                    {t('signupSubtitle')}
                </p>

                <form
                    onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                    className="space-y-3 sm:space-y-4 md:space-y-5">
                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                        <label
                            htmlFor="signup-first_name"
                            className="text-xs font-bold text-gray-400 block text-start">
                            {t('firstName')} *
                        </label>
                        <Input
                            id="signup-first_name"
                            type="text"
                            placeholder={t('firstNamePlaceholder')}
                            autoComplete="given-name"
                            {...signupForm.register('first_name')}
                            error={getFieldError(
                                signupForm.formState.errors,
                                'first_name',
                                vt,
                            )}
                            {...AUTH_SIGNUP_INPUT_PROPS}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                            <label
                                htmlFor="signup-middle_name"
                                className="text-xs font-bold text-gray-400 block text-start">
                                {t('middleName')}
                            </label>
                            <Input
                                id="signup-middle_name"
                                type="text"
                                placeholder={t('middleNamePlaceholder')}
                                autoComplete="additional-name"
                                {...signupForm.register('middle_name')}
                                error={getFieldError(
                                    signupForm.formState.errors,
                                    'middle_name',
                                    vt,
                                )}
                                {...AUTH_SIGNUP_INPUT_PROPS}
                            />
                        </div>
                        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                            <label
                                htmlFor="signup-last_name"
                                className="text-xs font-bold text-gray-400 block text-start">
                                {t('lastName')}
                            </label>
                            <Input
                                id="signup-last_name"
                                type="text"
                                placeholder={t('lastNamePlaceholder')}
                                autoComplete="family-name"
                                {...signupForm.register('last_name')}
                                error={getFieldError(
                                    signupForm.formState.errors,
                                    'last_name',
                                    vt,
                                )}
                                {...AUTH_SIGNUP_INPUT_PROPS}
                            />
                        </div>
                    </div>

                    <PhoneInput
                        id="signup-phone"
                        name="phone"
                        label={t('phone')}
                        value={phone}
                        onChange={() => {}}
                        required
                        disabled
                        inputClassName="bg-gray-100 text-gray-400"
                    />

                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                        <label
                            htmlFor="signup-email"
                            className="text-xs font-bold text-gray-400 block text-start">
                            {t('email')}
                        </label>
                        <Input
                            id="signup-email"
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            autoComplete="email"
                            {...signupForm.register('email')}
                            error={getFieldError(
                                signupForm.formState.errors,
                                'email',
                                vt,
                            )}
                            {...AUTH_SIGNUP_INPUT_PROPS}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="xl"
                        disabled={loading || !signupForm.formState.isValid}
                        className="w-full mt-3 sm:mt-4 md:mt-5 active:scale-[0.98]">
                        {loading ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('completeProfile')
                        )}
                    </Button>
                </form>
            </div>
        </AuthContainer>
    );
}
