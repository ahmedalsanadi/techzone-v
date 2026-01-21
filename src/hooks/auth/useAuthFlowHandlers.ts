/**
 * Hook for authentication flow handlers
 */

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/auth-service';
import { storeService } from '@/services/store-service';
import { useAuthStore } from '@/store/useAuthStore';
import { normalizeRedirectPath } from '@/lib/utils/redirect';
import { authStorage } from '@/lib/auth';
import { getAuthErrorMessage } from '@/lib/auth/error-handler';
import type { AuthStep, ProfileUpdateRequest } from '@/types/auth';
import { useCartMerge } from '@/hooks/useCartMerge';

interface UseAuthFlowHandlersOptions {
    step: AuthStep;
    setStep: (step: AuthStep) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    isNewUser: boolean;
    setIsNewUser: (isNewUser: boolean) => void;
    phone: string;
    setPhone: (phone: string) => void;
    tempToken: string | null;
    setTempToken: (token: string | null) => void;
    maskedPhone: string;
    setMaskedPhone: (phone: string) => void;
    otpExpiresAt: number | null;
    setOtpExpiresAt: (expiresAt: number | null) => void;
    otp: string;
    setOtp: (otp: string) => void;
    formData: ProfileUpdateRequest;
    setFormData: (
        data:
            | ProfileUpdateRequest
            | ((prev: ProfileUpdateRequest) => ProfileUpdateRequest),
    ) => void;
    redirectTo?: string;
    isAuthenticated: boolean;
}

export function useAuthFlowHandlers({
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
}: UseAuthFlowHandlersOptions) {
    const t = useTranslations('Auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth, setProfile } = useAuthStore();
    const { mergeGuestCartAfterAuth } = useCartMerge();

    // Step 1: Send OTP
    const handlePhoneSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!phone || phone.length < 9) {
                toast.error(t('invalidPhone') || 'رقم الهاتف غير صحيح');
                return;
            }

            setLoading(true);
            try {
                const response = await authService.sendOtp(phone);
                setIsNewUser(response.is_new_user);
                setTempToken(response.temp_token);
                setMaskedPhone(response.masked_phone);
                const expiresAt = Date.now() + response.expires_in * 1000;
                setOtpExpiresAt(expiresAt);
                authStorage.setOtpExpiresAt(response.expires_in);
                setStep('otp');
                toast.success(t('otpSent') || 'تم إرسال رمز التحقق بنجاح');
            } catch (error) {
                const message = getAuthErrorMessage(error, {
                    defaultMessage: t('otpError') || 'فشل إرسال رمز التحقق',
                    translations: {
                        tooManyRequests: t('tooManyRequests'),
                        networkError: t('networkError'),
                        unauthorizedError: t('unauthorizedError'),
                    },
                });
                toast.error(message);
            } finally {
                setLoading(false);
            }
        },
        [
            phone,
            setLoading,
            setIsNewUser,
            setTempToken,
            setMaskedPhone,
            setOtpExpiresAt,
            setStep,
            t,
        ],
    );

    // Step 2: Verify OTP
    const handleOtpSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!otp || otp.length < 4) {
                toast.error(t('invalidOtp') || 'رمز التحقق غير صحيح');
                return;
            }

            if (!tempToken) {
                toast.error(
                    t('sessionExpired') ||
                        'انتهت صلاحية الجلسة. يرجى المحاولة مرة أخرى',
                );
                setStep('phone');
                return;
            }

            setLoading(true);
            try {
                const response = await authService.login(phone, otp, tempToken);

                if (isNewUser) {
                    setStep('signup');
                    setAuth(response.customer, response.token);
                } else {
                    setAuth(response.customer, response.token);
                    await mergeGuestCartAfterAuth();
                }

                // Clear auth flow data
                authStorage.setPhone('');
                setTempToken(null);
                setMaskedPhone('');
                setOtpExpiresAt(null);

                toast.success(t('loginSuccess') || 'تم تسجيل الدخول بنجاح');

                if (!isNewUser) {
                    const redirectPath = normalizeRedirectPath(
                        redirectTo || searchParams.get('redirect'),
                    );
                    authStorage.clearAuthFlow();
                    setIsNewUser(false);
                    router.replace(redirectPath as any);
                }
            } catch (error) {
                const message = getAuthErrorMessage(error, {
                    defaultMessage: t('otpInvalid') || 'رمز التحقق غير صحيح',
                    translations: {
                        tooManyRequests: t('tooManyRequests'),
                        networkError: t('networkError'),
                    },
                });
                toast.error(message);
                setOtp('');
            } finally {
                setLoading(false);
            }
        },
        [
            otp,
            tempToken,
            phone,
            isNewUser,
            setStep,
            setAuth,
            mergeGuestCartAfterAuth,
            setTempToken,
            setMaskedPhone,
            setOtpExpiresAt,
            setIsNewUser,
            redirectTo,
            searchParams,
            router,
            t,
            setOtp,
        ],
    );

    // Step 3: Complete Profile
    const handleSignupSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!formData.first_name.trim()) {
                toast.error(t('firstNameRequired') || 'الاسم الأول مطلوب');
                return;
            }

            setLoading(true);
            try {
                const updatePayload: ProfileUpdateRequest = {
                    first_name: formData.first_name,
                    ...(formData.middle_name && {
                        middle_name: formData.middle_name,
                    }),
                    ...(formData.last_name && {
                        last_name: formData.last_name,
                    }),
                    ...(formData.email && { email: formData.email }),
                };

                const updatedProfile =
                    await storeService.updateProfile(updatePayload);

                setProfile(updatedProfile);
                await mergeGuestCartAfterAuth();

                authStorage.clearAuthFlow();
                setTempToken(null);
                setMaskedPhone('');
                setOtpExpiresAt(null);
                setIsNewUser(false);

                toast.success(
                    t('profileUpdated') || 'تم تحديث الملف الشخصي بنجاح',
                );

                const redirectPath = normalizeRedirectPath(
                    redirectTo || searchParams.get('redirect'),
                );
                router.replace(redirectPath as any);
            } catch (error) {
                const message = getAuthErrorMessage(error, {
                    defaultMessage:
                        t('profileError') || 'فشل تحديث الملف الشخصي',
                    translations: {
                        networkError: t('networkError'),
                        unauthorizedError: t('unauthorizedError'),
                    },
                });

                if (
                    error instanceof Error &&
                    (error as any).status === 401 &&
                    (error as any).status === 403
                ) {
                    authStorage.clearAll();
                    setIsNewUser(false);
                    setStep('phone');
                }

                toast.error(message);
            } finally {
                setLoading(false);
            }
        },
        [
            formData,
            setLoading,
            setProfile,
            mergeGuestCartAfterAuth,
            setTempToken,
            setMaskedPhone,
            setOtpExpiresAt,
            setIsNewUser,
            redirectTo,
            searchParams,
            router,
            t,
            setStep,
        ],
    );

    // Handle back navigation
    const handleBack = useCallback(() => {
        if (step === 'otp') {
            setStep('phone');
            setOtp('');
            setTempToken(null);
            setMaskedPhone('');
            setOtpExpiresAt(null);
            authStorage.setTempToken('');
            authStorage.setMaskedPhone('');
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
    }, [
        step,
        setStep,
        setOtp,
        setTempToken,
        setMaskedPhone,
        setOtpExpiresAt,
        isAuthenticated,
        isNewUser,
        setIsNewUser,
        t,
    ]);

    // Resend OTP
    const handleResendOtp = useCallback(async () => {
        if (!tempToken) {
            setStep('phone');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.resendOtp(tempToken);
            setMaskedPhone(response.masked_phone);
            const expiresIn = 300; // 5 minutes
            const expiresAt = Date.now() + expiresIn * 1000;
            setOtpExpiresAt(expiresAt);
            authStorage.setOtpExpiresAt(expiresIn);
            setOtp('');
            toast.success(t('otpResent') || 'تم إعادة إرسال رمز التحقق');
        } catch (error) {
            const message = getAuthErrorMessage(error, {
                defaultMessage: t('otpError') || 'فشل إرسال رمز التحقق',
                translations: {
                    tooManyRequests: t('tooManyRequests'),
                    networkError: t('networkError'),
                    unauthorizedError: t('unauthorizedError'),
                },
            });
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [
        tempToken,
        setStep,
        setLoading,
        setMaskedPhone,
        setOtpExpiresAt,
        setOtp,
        t,
    ]);

    return {
        handlePhoneSubmit,
        handleOtpSubmit,
        handleSignupSubmit,
        handleBack,
        handleResendOtp,
    };
}
