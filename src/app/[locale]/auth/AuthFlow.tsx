'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { StoreConfig } from '@/services/types';
import AuthContainer from '@/components/auth/AuthContainer';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import PhoneInput from '@/components/ui/PhoneInput';
import OtpStep from '@/components/ui/OtpStep';
import { authService } from '@/services/auth-service';
import { storeService } from '@/services/store-service';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { normalizeRedirectPath } from '@/lib/utils/redirect';
import { env } from '@/config/env';
import type { AuthStep, ProfileUpdateRequest } from '@/types/auth';
import { authStorage } from '@/lib/auth';
import { formatMaskedPhone, validateStoredStep } from '@/lib/auth/utils';

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
    const searchParams = useSearchParams();
    const {
        user,
        token,
        isAuthenticated,
        setAuth,
        setProfile,
        checkProfileComplete,
    } = useAuthStore();

    // State management - restore from sessionStorage on page refresh
    // Initialize with server-safe value to prevent hydration mismatch
    // Don't access sessionStorage during initial render
    const [step, setStep] = useState<AuthStep>(() => {
        // Use URL params or auth state (server-safe)
        if (initialStep === 'signup') return 'signup';
        if (initialStep === 'otp') return 'otp';
        if (!initialStep && isAuthenticated && !checkProfileComplete?.()) {
            return 'signup';
        }
        return 'phone';
    });

    // Update step from sessionStorage after hydration (client-side only)
    // This runs after the initial render to avoid hydration mismatch
    useEffect(() => {
        const storedStep = authStorage.getStep();
        const storedIsNewUser = authStorage.getIsNewUser();
        const storedPhone = authStorage.getPhone();

        if (storedStep && storedPhone) {
            const validatedStep = validateStoredStep(
                storedStep,
                storedIsNewUser,
                storedPhone,
            );
            if (validatedStep && validatedStep !== step) {
                setStep(validatedStep);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const [loading, setLoading] = useState(false);
    // Persist is_new_user flag in sessionStorage to survive navigation
    // Initialize with false on server to prevent hydration mismatch
    const [isNewUser, setIsNewUser] = useState(() => {
        if (typeof window === 'undefined') return false;
        return authStorage.getIsNewUser();
    });
    // Persist phone in sessionStorage to survive navigation
    // Initialize with empty string on server to prevent hydration mismatch
    const [phone, setPhone] = useState(() => {
        if (typeof window === 'undefined') return '';
        return authStorage.getPhone() || '';
    });
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState<ProfileUpdateRequest>({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: user?.email || '',
    });

    // Persist phone to sessionStorage when it changes
    useEffect(() => {
        authStorage.setPhone(phone);
    }, [phone]);

    // Persist is_new_user flag and current step to sessionStorage when they change
    useEffect(() => {
        authStorage.setIsNewUser(isNewUser);
        authStorage.setStep(step);
    }, [isNewUser, step]);

    // Validate current step based on auth state and is_new_user flag
    useEffect(() => {
        // CRITICAL: For new users, never redirect away from signup step
        // Even if profile appears complete (might be stale cached data)
        if (isAuthenticated && isNewUser && step === 'signup') {
            // Stay on signup step - user must complete it
            return;
        }

        // If user is authenticated and profile is complete, redirect away from auth pages
        // BUT: Don't redirect if user is on signup step or is a new user
        if (
            isAuthenticated &&
            checkProfileComplete() &&
            step !== 'signup' &&
            !isNewUser
        ) {
            const redirectPath = normalizeRedirectPath(
                redirectTo || searchParams.get('redirect'),
            );
            router.replace(redirectPath as any);
            return;
        }

        // If user is authenticated but profile incomplete, go to signup
        // Only if they are a new user (is_new_user = true)
        if (
            isAuthenticated &&
            !checkProfileComplete() &&
            isNewUser &&
            step !== 'signup'
        ) {
            setStep('signup');
            return;
        }

        // If user is authenticated but NOT a new user, they shouldn't be on signup step
        // This prevents manual navigation to signup when is_new_user = false
        if (isAuthenticated && !isNewUser && step === 'signup') {
            // Redirect to home or the redirect path
            const redirectPath = normalizeRedirectPath(
                redirectTo || searchParams.get('redirect'),
            );
            router.replace(redirectPath as any);
            return;
        }

        // If user is not authenticated but on signup step, check if they should be there
        if (!isAuthenticated && step === 'signup') {
            // Only allow signup step if is_new_user flag is true
            if (!isNewUser) {
                setStep('phone');
                return;
            }
            // If no phone, go back to phone step
            if (!phone) {
                setStep('phone');
                return;
            }
        }

        // If user is not authenticated but on otp step without phone, redirect to phone
        if (!isAuthenticated && step === 'otp' && !phone) {
            setStep('phone');
            return;
        }
    }, [
        isAuthenticated,
        checkProfileComplete,
        step,
        phone,
        isNewUser,
        redirectTo,
        searchParams,
        router,
    ]);

    // Load user profile if authenticated
    // IMPORTANT: Don't load profile if user is on signup step (new user flow)
    // This prevents redirecting new users away from the signup form
    const loadProfile = useCallback(async () => {
        // Don't load profile if we're on the signup step - user needs to complete it first
        if (step === 'signup' && isNewUser) {
            return;
        }

        try {
            const profile = await storeService.getProfile();
            setProfile(profile);
            if (profile.is_profile_complete) {
                const redirectPath = normalizeRedirectPath(
                    redirectTo || searchParams.get('redirect'),
                );
                router.replace(redirectPath as any);
            } else {
                setFormData((prev) => ({
                    ...prev,
                    email: profile.email || prev.email,
                }));
            }
        } catch (error) {
            if (env.isDev) {
                console.error('Failed to load profile:', error);
            }
        }
    }, [setProfile, redirectTo, searchParams, router, step, isNewUser]);

    useEffect(() => {
        // Only load profile if:
        // 1. User is authenticated
        // 2. We have a token
        // 3. Profile is not complete
        // 4. User is NOT on signup step (new users need to complete signup first)
        // 5. User is NOT a new user (new users must complete signup before loading profile)
        if (
            isAuthenticated &&
            token &&
            !checkProfileComplete() &&
            step !== 'signup' &&
            !isNewUser
        ) {
            loadProfile();
        }
    }, [
        isAuthenticated,
        token,
        checkProfileComplete,
        loadProfile,
        step,
        isNewUser,
    ]);

    // Step 1: Send OTP
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || phone.length < 9) {
            toast.error(t('invalidPhone') || 'رقم الهاتف غير صحيح');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.sendOtp(phone);
            // Persist is_new_user flag from API response
            setIsNewUser(response.is_new_user);
            setStep('otp');
            toast.success(t('otpSent') || 'تم إرسال رمز التحقق بنجاح');
        } catch (error: any) {
            // Handle different error types
            let message = t('otpError') || 'فشل إرسال رمز التحقق';

            if (error?.message) {
                message = error.message;
            } else if (error?.status === 504 || error?.name === 'AbortError') {
                message =
                    t('networkError') ||
                    'خطأ في الاتصال. يرجى المحاولة مرة أخرى';
            } else if (error?.status === 401 || error?.status === 403) {
                message =
                    t('unauthorizedError') ||
                    'غير مصرح. يرجى المحاولة مرة أخرى';
            }

            toast.error(message);
            // Don't change step on error, let user try again
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || otp.length < 4) {
            toast.error(t('invalidOtp') || 'رمز التحقق غير صحيح');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.login(phone, otp);

            // Flow based on is_new_user flag:
            // - If is_new_user = true: Must complete profile (go to signup step)
            // - If is_new_user = false: Skip signup, redirect directly
            if (isNewUser) {
                // For new users: Set step to signup FIRST, then setAuth
                // This helps prevent useEffects from redirecting before step is set
                setStep('signup');
                // Call setAuth - the validation useEffect will ensure we stay on signup step
                setAuth(response.customer, response.token);
            } else {
                // For existing users: setAuth immediately, then redirect
                setAuth(response.customer, response.token);
            }

            // Clear phone from sessionStorage after successful login
            // Keep is_new_user flag if user needs to complete profile
            authStorage.setPhone('');
            // Don't clear auth_step yet - will be cleared after signup or redirect

            toast.success(t('loginSuccess') || 'تم تسجيل الدخول بنجاح');

            // Handle redirect for existing users (new users stay on signup step)
            if (!isNewUser) {
                // Existing user: Skip signup, redirect to intended destination or home
                const redirectPath = normalizeRedirectPath(
                    redirectTo || searchParams.get('redirect'),
                );
                // Clear auth-related sessionStorage since we're done with auth flow
                authStorage.clearAuthFlow();
                setIsNewUser(false);
                router.replace(redirectPath as any);
            }
            // Note: New users (isNewUser = true) will stay on signup step
            // The step was set above, and useEffects will ensure they stay there
        } catch (error: any) {
            // Handle different error types for OTP verification
            let message = t('otpInvalid') || 'رمز التحقق غير صحيح';

            if (error?.message) {
                message = error.message;
            } else if (error?.status === 504 || error?.name === 'AbortError') {
                message =
                    t('networkError') ||
                    'خطأ في الاتصال. يرجى المحاولة مرة أخرى';
            } else if (error?.status === 401 || error?.status === 403) {
                message = t('otpInvalid') || 'رمز التحقق غير صحيح';
            }

            toast.error(message);
            // Clear OTP on error to allow retry
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Complete Profile
    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name.trim()) {
            toast.error(t('firstNameRequired') || 'الاسم الأول مطلوب');
            return;
        }

        setLoading(true);
        try {
            const updatePayload: ProfileUpdateRequest = {
                first_name: formData.first_name,
                ...(formData.middle_name && { middle_name: formData.middle_name }),
                ...(formData.last_name && { last_name: formData.last_name }),
                ...(formData.email && { email: formData.email }),
            };
            
            const updatedProfile = await storeService.updateProfile(updatePayload);

            setProfile(updatedProfile);

            // Clear all auth-related sessionStorage after successful profile completion
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('auth_phone');
                sessionStorage.removeItem('auth_is_new_user');
                sessionStorage.removeItem('auth_step');
            }

            // Clear is_new_user flag since profile is now complete
            setIsNewUser(false);

            toast.success(t('profileUpdated') || 'تم تحديث الملف الشخصي بنجاح');

            // Redirect to intended destination or home
            const redirectPath = normalizeRedirectPath(
                redirectTo || searchParams.get('redirect'),
            );
            router.replace(redirectPath as any);
        } catch (error: any) {
            // Handle different error types for profile update
            let message = t('profileError') || 'فشل تحديث الملف الشخصي';

            if (error?.message) {
                message = error.message;
            } else if (error?.status === 504 || error?.name === 'AbortError') {
                message =
                    t('networkError') ||
                    'خطأ في الاتصال. يرجى المحاولة مرة أخرى';
            } else if (error?.status === 401 || error?.status === 403) {
                message =
                    t('unauthorizedError') ||
                    'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى';
                // If unauthorized, redirect to phone step
                authStorage.clearAll();
                setIsNewUser(false);
                setStep('phone');
            }

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Handle back navigation with proper validation
    const handleBack = () => {
        if (step === 'otp') {
            setStep('phone');
            setOtp('');
            // Keep phone number when going back
        } else if (step === 'signup') {
            // If user is authenticated and is_new_user, they can't go back from signup
            // They must complete it or logout
            if (isAuthenticated && isNewUser) {
                toast.info(
                    t('completeProfileRequired') ||
                        'يجب إكمال الملف الشخصي للمتابعة',
                );
                return;
            }
            // If not authenticated or not a new user, allow going back
            if (!isAuthenticated || !isNewUser) {
                setStep('phone');
                // Clear is_new_user flag if going back from signup when not authenticated
                if (!isAuthenticated) {
                    authStorage.setIsNewUser(false);
                    setIsNewUser(false);
                }
            }
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (!phone) {
            setStep('phone');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.sendOtp(phone);
            // Update is_new_user flag in case it changed (shouldn't, but handle it)
            setIsNewUser(response.is_new_user);
            setOtp('');
            toast.success(t('otpResent') || 'تم إعادة إرسال رمز التحقق');
        } catch (error: any) {
            // Handle different error types for resend OTP
            let message = t('otpError') || 'فشل إرسال رمز التحقق';

            if (error?.message) {
                message = error.message;
            } else if (error?.status === 504 || error?.name === 'AbortError') {
                message =
                    t('networkError') ||
                    'خطأ في الاتصال. يرجى المحاولة مرة أخرى';
            } else if (error?.status === 401 || error?.status === 403) {
                message =
                    t('unauthorizedError') ||
                    'غير مصرح. يرجى المحاولة مرة أخرى';
            }

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const maskedPhone = formatMaskedPhone(phone);

    // Render based on current step
    if (step === 'phone') {
        return (
            <AuthContainer
                config={config}
                locale={locale}
                title={t('phoneTitle') || 'تسجيل الدخول'}
                onBack={undefined}>
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={handlePhoneSubmit} className="space-y-6">
                        <PhoneInput
                            label={t('phone') || 'رقم الهاتف'}
                            value={phone}
                            onChange={setPhone}
                            required
                            inputClassName="bg-[#F4F7FA]"
                        />

                        <div className="text-sm text-[#2D3142] text-start">
                            {t('termsText')}{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/terms' as any)}
                                className="text-theme-primary font-bold hover:underline">
                                {t('termsLink')}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !phone}
                            className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] mt-6 bg-theme-primary hover:brightness-[0.95] shadow-theme-primary/20">
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    maskedPhone={maskedPhone}
                    subtitle={t('otpSubtitle') || 'أدخل رمز التحقق المرسل إلى'}
                    continueLabel={t('continue') || 'متابعة'}
                    resendLabel={t('resend') || 'إعادة الإرسال'}
                    timer="00:30"
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xl font-black text-[#2D3142] text-start">
                    {t('signupSubtitle') || 'أكمل بياناتك الشخصية للمتابعة'}
                </p>

                <form onSubmit={handleSignupSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 block text-start">
                            {t('firstName') || 'الاسم الأول'} *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="احمد"
                            className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                            value={formData.first_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    first_name: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('middleName') || 'اسم الأب'}
                            </label>
                            <input
                                type="text"
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                                value={formData.middle_name || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        middle_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('lastName') || 'اللقب'}
                            </label>
                            <input
                                type="text"
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        last_name: e.target.value,
                                    })
                                }
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

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 block text-start">
                            {t('email') || 'البريد الإلكتروني'}
                        </label>
                        <input
                            type="email"
                            placeholder="someone@gmail.com"
                            className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
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
                        disabled={loading || !formData.first_name.trim()}
                        className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] mt-6 bg-libero-red shadow-libero-red/20">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('completeProfile') || 'إكمال الملف الشخصي'
                        )}
                    </Button>
                </form>
            </div>
        </AuthContainer>
    );
}
