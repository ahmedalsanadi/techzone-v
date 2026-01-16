/**
 * Authentication storage utilities
 * Handles sessionStorage for auth flow state persistence
 */

import { AUTH_STORAGE_KEYS } from './constants';
import type { AuthStep } from '@/types/auth';

/**
 * Session storage helper for auth flow
 */
export const authStorage = {
    /**
     * Get stored phone number
     */
    getPhone(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(AUTH_STORAGE_KEYS.PHONE);
    },

    /**
     * Set phone number
     */
    setPhone(phone: string): void {
        if (typeof window === 'undefined') return;
        if (phone) {
            sessionStorage.setItem(AUTH_STORAGE_KEYS.PHONE, phone);
        } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEYS.PHONE);
        }
    },

    /**
     * Get is_new_user flag
     */
    getIsNewUser(): boolean {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem(AUTH_STORAGE_KEYS.IS_NEW_USER) === 'true';
    },

    /**
     * Set is_new_user flag
     */
    setIsNewUser(isNewUser: boolean): void {
        if (typeof window === 'undefined') return;
        if (isNewUser) {
            sessionStorage.setItem(AUTH_STORAGE_KEYS.IS_NEW_USER, 'true');
        } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEYS.IS_NEW_USER);
        }
    },

    /**
     * Get current auth step
     */
    getStep(): AuthStep | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(AUTH_STORAGE_KEYS.STEP) as AuthStep | null;
    },

    /**
     * Set current auth step
     */
    setStep(step: AuthStep): void {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem(AUTH_STORAGE_KEYS.STEP, step);
    },

    /**
     * Clear all auth-related session storage
     */
    clearAll(): void {
        if (typeof window === 'undefined') return;
        Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
            sessionStorage.removeItem(key);
        });
    },

    /**
     * Clear auth flow data (keeps phone if needed)
     */
    clearAuthFlow(): void {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.IS_NEW_USER);
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.STEP);
    },
};
