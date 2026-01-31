/**
 * Branch-related cookie utilities
 */

import { BRANCH_COOKIES } from './constants';
import { COOKIE_MAX_AGE } from '../auth/constants';

/**
 * Cookie helper for branches
 */
export const branchCookies = {
    /**
     * Set branch ID cookie
     */
    setBranchId(branchId: number | string): void {
        if (typeof window === 'undefined') return;
        const secure =
            typeof window !== 'undefined' && window.location.protocol === 'https:'
                ? '; Secure'
                : '';
        document.cookie = `${BRANCH_COOKIES.BRANCH_ID}=${branchId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    },

    /**
     * Get branch ID from cookies
     */
    getBranchId(): string | null {
        if (typeof window === 'undefined') return null;

        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${BRANCH_COOKIES.BRANCH_ID}=`);
            if (parts.length === 2) {
                const id = parts.pop()?.split(';').shift()?.trim();
                if (id) return id;
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to read branchId from cookies:', error);
            }
        }

        return null;
    },

    /**
     * Clear branch ID cookie
     */
    clearBranchId(): void {
        if (typeof window === 'undefined') return;
        const expireDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
        const secure =
            typeof window !== 'undefined' && window.location.protocol === 'https:'
                ? '; Secure'
                : '';
        document.cookie = `${BRANCH_COOKIES.BRANCH_ID}=; path=/; expires=${expireDate}; SameSite=Lax${secure}`;
    },
};
