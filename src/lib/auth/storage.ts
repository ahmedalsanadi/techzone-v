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
     * Get temp token
     */
    getTempToken(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(AUTH_STORAGE_KEYS.TEMP_TOKEN);
    },

    /**
     * Set temp token
     */
    setTempToken(tempToken: string): void {
        if (typeof window === 'undefined') return;
        if (tempToken) {
            sessionStorage.setItem(AUTH_STORAGE_KEYS.TEMP_TOKEN, tempToken);
        } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEYS.TEMP_TOKEN);
        }
    },

    /**
     * Get masked phone
     */
    getMaskedPhone(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(AUTH_STORAGE_KEYS.MASKED_PHONE);
    },

    /**
     * Set masked phone
     */
    setMaskedPhone(maskedPhone: string): void {
        if (typeof window === 'undefined') return;
        if (maskedPhone) {
            sessionStorage.setItem(AUTH_STORAGE_KEYS.MASKED_PHONE, maskedPhone);
        } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEYS.MASKED_PHONE);
        }
    },

    /**
     * Get OTP expiration timestamp
     */
    getOtpExpiresAt(): number | null {
        if (typeof window === 'undefined') return null;
        const expiresAt = sessionStorage.getItem(AUTH_STORAGE_KEYS.OTP_EXPIRES_AT);
        return expiresAt ? parseInt(expiresAt, 10) : null;
    },

    /**
     * Set OTP expiration timestamp
     */
    setOtpExpiresAt(expiresIn: number): void {
        if (typeof window === 'undefined') return;
        if (expiresIn <= 0) {
            sessionStorage.removeItem(AUTH_STORAGE_KEYS.OTP_EXPIRES_AT);
            return;
        }
        // expiresIn is in seconds, convert to timestamp
        const expiresAt = Date.now() + expiresIn * 1000;
        sessionStorage.setItem(AUTH_STORAGE_KEYS.OTP_EXPIRES_AT, expiresAt.toString());
    },

    /**
     * Check if OTP is expired
     */
    isOtpExpired(): boolean {
        if (typeof window === 'undefined') return true;
        const expiresAt = this.getOtpExpiresAt();
        if (!expiresAt) return true;
        return Date.now() >= expiresAt;
    },

    /**
     * Clear auth flow data (keeps phone if needed)
     */
    clearAuthFlow(): void {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.IS_NEW_USER);
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.STEP);
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.TEMP_TOKEN);
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.MASKED_PHONE);
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.OTP_EXPIRES_AT);
    },
};
