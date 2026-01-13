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

type AuthStep = 'phone' | 'otp' | 'signup';

interface AuthFlowProps {
    config: StoreConfig;
    locale: string;
    initialStep?: string;
    redirectTo?: string;
}

export default function AuthFlow({ config, locale, initialStep, redirectTo }: AuthFlowProps) {
    const t = useTranslations('Auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    console.log('searchParams in AuthFlow componets is'+searchParams)
    const { user, token, isAuthenticated, setAuth, setProfile, checkProfileComplete } = useAuthStore();

    // State management
    const [step, setStep] = useState<AuthStep>(() => {
        // Determine initial step based on URL params first, then auth state
        if (initialStep === 'signup') return 'signup';
        if (initialStep === 'otp') return 'otp';
        // Only check auth state if no initial step specified
        if (!initialStep && isAuthenticated && !checkProfileComplete()) return 'signup';
        return 'phone';
    });
    
    const [loading, setLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    // Persist phone in sessionStorage to survive navigation
    const [phone, setPhone] = useState(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('auth_phone') || '';
        }
        return '';
    });
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: user?.email || '',
    });

    // Persist phone to sessionStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && phone) {
            sessionStorage.setItem('auth_phone', phone);
        } else if (typeof window !== 'undefined' && !phone) {
            sessionStorage.removeItem('auth_phone');
        }
    }, [phone]);

    // Validate current step based on auth state
    useEffect(() => {
        // If user is authenticated and profile is complete, redirect
        if (isAuthenticated && checkProfileComplete()) {
            const redirectPath = normalizeRedirectPath(redirectTo || searchParams.get('redirect'));
            router.replace(redirectPath as any);
            return;
        }

        // If user is authenticated but profile incomplete, go to signup
        if (isAuthenticated && !checkProfileComplete() && step !== 'signup') {
            setStep('signup');
            return;
        }

        // If user is not authenticated but on signup step, redirect to phone
        if (!isAuthenticated && step === 'signup') {
            setStep('phone');
            return;
        }

        // If user is not authenticated but on otp step without phone, redirect to phone
        if (!isAuthenticated && step === 'otp' && !phone) {
            setStep('phone');
            return;
        }
    }, [isAuthenticated, checkProfileComplete, step, phone, redirectTo, searchParams, router]);

    // Load user profile if authenticated
    const loadProfile = useCallback(async () => {
        try {
            const profile = await storeService.getProfile();
            setProfile(profile);
            if (profile.is_profile_complete) {
                const redirectPath = normalizeRedirectPath(redirectTo || searchParams.get('redirect'));
                router.replace(redirectPath as any);
            } else {
                setFormData(prev => ({
                    ...prev,
                    email: profile.email || prev.email,
                }));
            }
        } catch (error) {
            if (env.isDev) {
                console.error('Failed to load profile:', error);
            }
        }
    }, [setProfile, redirectTo, searchParams, router]);

    useEffect(() => {
        if (isAuthenticated && token && !checkProfileComplete()) {
            loadProfile();
        }
    }, [isAuthenticated, token, checkProfileComplete, loadProfile]);

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
            setIsNewUser(response.is_new_user);
            setStep('otp');
            toast.success(t('otpSent') || 'تم إرسال رمز التحقق بنجاح');
        } catch (error: any) {
            const message = error?.message || t('otpError') || 'فشل إرسال رمز التحقق';
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
            setAuth(response.customer, response.token);
            
            // Clear phone from sessionStorage after successful login
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('auth_phone');
            }

            toast.success(t('loginSuccess') || 'تم تسجيل الدخول بنجاح');

            // Check if profile needs completion
            if (isNewUser || !response.customer.is_profile_complete) {
                setStep('signup');
            } else {
                const redirectPath = normalizeRedirectPath(redirectTo || searchParams.get('redirect'));
                router.replace(redirectPath as any);
            }
        } catch (error: any) {
            const message = error?.message || t('otpInvalid') || 'رمز التحقق غير صحيح';
            toast.error(message);
            // Clear OTP on error
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
            const updatedProfile = await storeService.updateProfile({
                first_name: formData.first_name,
                middle_name: formData.middle_name,
                last_name: formData.last_name,
                email: formData.email,
            });

            setProfile(updatedProfile);
            
            // Clear phone from sessionStorage after successful profile completion
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('auth_phone');
            }
            
            toast.success(t('profileUpdated') || 'تم تحديث الملف الشخصي بنجاح');
            
            const redirectPath = normalizeRedirectPath(redirectTo || searchParams.get('redirect'));
            router.replace(redirectPath as any);
        } catch (error: any) {
            const message = error?.message || t('profileError') || 'فشل تحديث الملف الشخصي';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        if (step === 'otp') {
            setStep('phone');
            setOtp('');
            // Keep phone number when going back
        } else if (step === 'signup') {
            // If user is authenticated, they can't go back from signup
            // They must complete it or logout
            if (isAuthenticated) {
                toast.info(t('completeProfileRequired') || 'يجب إكمال الملف الشخصي للمتابعة');
                return;
            }
            setStep('phone');
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
            setIsNewUser(response.is_new_user);
            setOtp('');
            toast.success(t('otpResent') || 'تم إعادة إرسال رمز التحقق');
        } catch (error: any) {
            toast.error(error?.message || t('otpError') || 'فشل إرسال رمز التحقق');
        } finally {
            setLoading(false);
        }
    };

    const maskedPhone = phone ? `+966${phone.replace(/\d(?=\d{4})/g, '*')}` : '';

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
                                className="text-libero-red font-bold hover:underline">
                                {t('termsLink')}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !phone}
                            className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] mt-6 bg-libero-red shadow-libero-red/20">
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
                            className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                            value={formData.first_name}
                            onChange={(e) =>
                                setFormData({ ...formData, first_name: e.target.value })
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
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                                value={formData.middle_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, middle_name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 block text-start">
                                {t('lastName') || 'اللقب'}
                            </label>
                            <input
                                type="text"
                                className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, last_name: e.target.value })
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
                            className="w-full h-16 px-6 rounded-2xl bg-[#F4F7FA] border border-[#E2E8F0] focus:border-[#B44734]/30 focus:ring-4 focus:ring-[#B44734]/5 outline-none transition-all font-bold text-lg text-[#2D3142] text-start"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
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
