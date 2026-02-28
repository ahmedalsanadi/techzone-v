/**
 * Authentication utility functions
 */

import type { AuthStep } from '@/types/auth';
import { authStorage } from './storage';

/**
 * Validate if a stored auth step is valid based on current state
 */
export function validateStoredStep(
    storedStep: AuthStep | null,
    storedIsNewUser: boolean,
    storedPhone: string | null,
    storedTempToken?: string | null,
): AuthStep | null {
    if (!storedStep || !storedPhone) return null;

    // Validate step makes sense with current state
    // For OTP step, we need temp_token
    if (storedStep === 'otp' && storedPhone && storedTempToken) {
        return 'otp';
    }

    if (storedStep === 'signup' && storedIsNewUser && storedPhone) {
        return 'signup';
    }

    return null;
}

/**
 * Get initial auth step based on URL params and stored state
 */
export function getInitialAuthStep(
    initialStep?: string,
    isAuthenticated?: boolean,
    checkProfileComplete?: () => boolean,
): AuthStep {
    // Try to restore from sessionStorage first (include tempToken for otp step)
    if (typeof window !== 'undefined') {
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
            if (validatedStep) return validatedStep;
        }
    }

    // Determine initial step based on URL params
    if (initialStep === 'signup') return 'signup';
    if (initialStep === 'otp') return 'otp';

    // Check auth state if no initial step specified
    if (!initialStep && isAuthenticated && !checkProfileComplete?.()) {
        return 'signup';
    }

    return 'phone';
}

/**
 * Format phone number for display (masked)
 */
export function formatMaskedPhone(phone: string): string {
    if (!phone) return '';
    return `+966${phone.replace(/\d(?=\d{4})/g, '*')}`;
}
