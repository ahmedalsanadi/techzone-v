/**
 * Hook for managing OTP countdown timer
 */

import { useMemo, useSyncExternalStore } from 'react';
import type { AuthStep } from '@/types/auth';

/**
 * IMPORTANT:
 * `useSyncExternalStore` requires `getSnapshot` to be stable between renders
 * unless a store change occurs. Returning `Date.now()` directly from `getSnapshot`
 * causes infinite re-render loops (Maximum update depth exceeded).
 *
 * This store caches "now" and only updates it on an interval tick.
 */
function createNowStore(intervalMs: number) {
    let now = Date.now();
    const listeners = new Set<() => void>();
    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
        if (id) return;
        id = setInterval(() => {
            now = Date.now();
            listeners.forEach((l) => l());
        }, intervalMs);
    };

    const stop = () => {
        if (!id) return;
        if (listeners.size > 0) return;
        clearInterval(id);
        id = null;
    };

    return {
        subscribe: (onStoreChange: () => void) => {
            listeners.add(onStoreChange);
            start();
            return () => {
                listeners.delete(onStoreChange);
                stop();
            };
        },
        getSnapshot: () => now,
        getServerSnapshot: () => 0,
    };
}

const now1sStore = createNowStore(1000);

function useNow1s() {
    return useSyncExternalStore(
        now1sStore.subscribe,
        now1sStore.getSnapshot,
        now1sStore.getServerSnapshot,
    );
}

export function useOtpTimer(
    step: AuthStep,
    otpExpiresAt: number | null,
    _setOtpExpiresAt: (value: number | null) => void,
) {
    void _setOtpExpiresAt; // kept for backward compatibility with existing call sites
    const now = useNow1s();

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
