/**
 * Hook for managing authentication flow state
 */

import { useState, useEffect } from 'react';
import type { AuthStep, ProfileUpdateRequest } from '@/types/auth';
import { authStorage } from '@/lib/auth';
import { validateStoredStep } from '@/lib/auth/utils';

interface UseAuthFlowStateOptions {
    initialStep?: string;
    isAuthenticated: boolean;
    checkProfileComplete: () => boolean;
    userEmail?: string | null;
}

export function useAuthFlowState({
    initialStep,
    isAuthenticated,
    checkProfileComplete,
    userEmail,
}: UseAuthFlowStateOptions) {
    // Step state
    const [step, setStep] = useState<AuthStep>(() => {
        if (initialStep === 'signup') return 'signup';
        if (initialStep === 'otp') return 'otp';
        if (!initialStep && isAuthenticated && !checkProfileComplete()) {
            return 'signup';
        }
        return 'phone';
    });

    // Restore step from sessionStorage after hydration
    useEffect(() => {
        const storedStep = authStorage.getStep();
        const storedIsNewUser = authStorage.getIsNewUser();
        const storedPhone = authStorage.getPhone();
        const storedTempToken = authStorage.getTempToken();

        if (storedStep && storedPhone) {
            const validatedStep = validateStoredStep(
                storedStep,
                storedIsNewUser,
                storedPhone,
                storedTempToken,
            );
            if (validatedStep && validatedStep !== step) {
                setStep(validatedStep);
                // Restore temp_token and masked_phone if going to OTP step
                if (validatedStep === 'otp' && storedTempToken) {
                    setTempToken(storedTempToken);
                    const storedMaskedPhone = authStorage.getMaskedPhone();
                    if (storedMaskedPhone) {
                        setMaskedPhone(storedMaskedPhone);
                    }
                    const storedExpiresAt = authStorage.getOtpExpiresAt();
                    if (storedExpiresAt && !authStorage.isOtpExpired()) {
                        setOtpExpiresAt(storedExpiresAt);
                    } else if (storedExpiresAt && authStorage.isOtpExpired()) {
                        // If expired, clear it
                        setOtpExpiresAt(null);
                        authStorage.setOtpExpiresAt(0);
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Form state
    const [loading, setLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(() => {
        if (typeof window === 'undefined') return false;
        return authStorage.getIsNewUser();
    });
    const [phone, setPhone] = useState(() => {
        if (typeof window === 'undefined') return '';
        return authStorage.getPhone() || '';
    });
    const [tempToken, setTempToken] = useState(() => {
        if (typeof window === 'undefined') return null;
        return authStorage.getTempToken();
    });
    const [maskedPhone, setMaskedPhone] = useState(() => {
        if (typeof window === 'undefined') return '';
        return authStorage.getMaskedPhone() || '';
    });
    const [otpExpiresAt, setOtpExpiresAt] = useState(() => {
        if (typeof window === 'undefined') return null;
        return authStorage.getOtpExpiresAt();
    });
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState<ProfileUpdateRequest>({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: userEmail || '',
    });

    // Persist state to sessionStorage
    useEffect(() => {
        authStorage.setPhone(phone);
    }, [phone]);

    useEffect(() => {
        if (tempToken) {
            authStorage.setTempToken(tempToken);
        } else {
            authStorage.setTempToken('');
        }
    }, [tempToken]);

    useEffect(() => {
        if (maskedPhone) {
            authStorage.setMaskedPhone(maskedPhone);
        } else {
            authStorage.setMaskedPhone('');
        }
    }, [maskedPhone]);

    useEffect(() => {
        if (otpExpiresAt) {
            authStorage.setOtpExpiresAt((otpExpiresAt - Date.now()) / 1000);
        }
    }, [otpExpiresAt]);

    useEffect(() => {
        authStorage.setIsNewUser(isNewUser);
        authStorage.setStep(step);
    }, [isNewUser, step]);

    return {
        // Step management
        step,
        setStep,

        // Loading state
        loading,
        setLoading,

        // User flags
        isNewUser,
        setIsNewUser,

        // Phone & OTP
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

        // Form data
        formData,
        setFormData,
    };
}
