/**
 * Hook for managing OTP countdown timer
 */

import { useState, useEffect } from 'react';
import { authStorage } from '@/lib/auth';
import type { AuthStep } from '@/types/auth';

export function useOtpTimer(
    step: AuthStep,
    otpExpiresAt: number | null,
    setOtpExpiresAt: (value: number | null) => void,
) {
    const [timer, setTimer] = useState<string>('');

    useEffect(() => {
        if (!otpExpiresAt || step !== 'otp') {
            setTimer('');
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(
                0,
                Math.floor((otpExpiresAt - now) / 1000),
            );

            if (remaining <= 0) {
                setTimer('');
                setOtpExpiresAt(null);
                authStorage.setOtpExpiresAt(0);
                return;
            }

            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            setTimer(
                `${minutes.toString().padStart(2, '0')}:${seconds
                    .toString()
                    .padStart(2, '0')}`,
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [otpExpiresAt, step, setOtpExpiresAt]);

    // Check if OTP is expired on mount/step change
    useEffect(() => {
        if (step === 'otp' && otpExpiresAt && Date.now() >= otpExpiresAt) {
            setOtpExpiresAt(null);
            setTimer('');
        }
    }, [step, otpExpiresAt, setOtpExpiresAt]);

    return timer;
}
