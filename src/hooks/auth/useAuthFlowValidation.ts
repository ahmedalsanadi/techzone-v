/**
 * Hook for validating authentication flow steps
 */

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { normalizeRedirectPath } from '@/lib/utils';
import type { AuthStep } from '@/types/auth';

interface UseAuthFlowValidationOptions {
    step: AuthStep;
    setStep: (step: AuthStep) => void;
    isAuthenticated: boolean;
    isNewUser: boolean;
    phone: string;
    checkProfileComplete: () => boolean;
    redirectTo?: string;
}

export function useAuthFlowValidation({
    step,
    setStep,
    isAuthenticated,
    isNewUser,
    phone,
    checkProfileComplete,
    redirectTo,
}: UseAuthFlowValidationOptions) {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // CRITICAL: For new users, never redirect away from signup step
        if (isAuthenticated && isNewUser && step === 'signup') {
            return;
        }

        // If user is authenticated and profile is complete, redirect away from auth pages
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
        if (isAuthenticated && !isNewUser && step === 'signup') {
            const redirectPath = normalizeRedirectPath(
                redirectTo || searchParams.get('redirect'),
            );
            router.replace(redirectPath as any);
            return;
        }

        // If user is not authenticated but on signup step, check if they should be there
        if (!isAuthenticated && step === 'signup') {
            if (!isNewUser) {
                setStep('phone');
                return;
            }
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
        setStep,
    ]);
}
