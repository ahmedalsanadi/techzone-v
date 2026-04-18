/**
 * Hook for managing authentication flow state
 */

import { useState, useEffect } from 'react';
import type { AuthStep, ProfileUpdateRequest } from '@/types/auth';
import { authStorage } from '@/lib/auth';
import { getInitialAuthStep } from '@/lib/auth/utils';

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
    // Single source of truth: initial step from URL params, sessionStorage, and auth state
    const [step, setStep] = useState<AuthStep>(() =>
        getInitialAuthStep(initialStep, isAuthenticated, checkProfileComplete),
    );

    // Form state - all state declarations
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
        // Restore tempToken from storage on initial load
        const storedStep = authStorage.getStep();
        const storedPhone = authStorage.getPhone();
        const storedTempToken = authStorage.getTempToken();
        if (storedStep === 'otp' && storedPhone && storedTempToken) {
            return storedTempToken;
        }
        return null;
    });
    const [maskedPhone, setMaskedPhone] = useState(() => {
        if (typeof window === 'undefined') return '';
        // Restore maskedPhone from storage on initial load
        const storedStep = authStorage.getStep();
        const storedPhone = authStorage.getPhone();
        const storedTempToken = authStorage.getTempToken();
        if (storedStep === 'otp' && storedPhone && storedTempToken) {
            return authStorage.getMaskedPhone() || '';
        }
        return '';
    });
    const [otpExpiresAt, setOtpExpiresAt] = useState(() => {
        if (typeof window === 'undefined') return null;
        // Restore otpExpiresAt from storage on initial load
        const storedStep = authStorage.getStep();
        const storedPhone = authStorage.getPhone();
        const storedTempToken = authStorage.getTempToken();
        if (storedStep === 'otp' && storedPhone && storedTempToken) {
            const expiresAt = authStorage.getOtpExpiresAt();
            if (expiresAt && !authStorage.isOtpExpired()) {
                return expiresAt;
            }
        }
        return null;
    });
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState<ProfileUpdateRequest>({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: userEmail || '',
    });

    // OTP expiry checker
    useEffect(() => {
        if (step !== 'otp' || !otpExpiresAt) return;
        
        const checkExpiry = () => {
            if (authStorage.isOtpExpired()) {
                setOtpExpiresAt(null);
                authStorage.setOtpExpiresAt(0);
            }
        };
        
        checkExpiry();
        const interval = setInterval(checkExpiry, 1000);
        return () => clearInterval(interval);
    }, [step, otpExpiresAt]);

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