/**
 * Hook for managing OTP countdown timer
 */

import { useMemo, useSyncExternalStore } from 'react';
import type { AuthStep } from '@/types/auth';

function useNow(intervalMs: number) {
    return useSyncExternalStore(
        (onStoreChange) => {
            const id = setInterval(onStoreChange, intervalMs);
            return () => clearInterval(id);
        },
        () => Date.now(),
        () => 0,
    );
}

export function useOtpTimer(
    step: AuthStep,
    otpExpiresAt: number | null,
    _setOtpExpiresAt: (value: number | null) => void,
) {
    const now = useNow(1000);

    return useMemo(() => {
        if (!otpExpiresAt || step !== 'otp') return '';
        const remaining = Math.max(0, Math.floor((otpExpiresAt - now) / 1000));
        if (remaining <= 0) return '';
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
    }, [now, otpExpiresAt, step]);
}
