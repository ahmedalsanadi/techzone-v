/**
 * Authentication cookie utilities
 */

import { AUTH_COOKIES, COOKIE_MAX_AGE } from './constants';

/**
 * Cookie helper for authentication
 */
export const authCookies = {
    /**
     * Set access token cookie
     */
    setAccessToken(token: string): void {
        if (typeof window === 'undefined') return;
        document.cookie = `${AUTH_COOKIES.ACCESS_TOKEN}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    },

    /**
     * Get access token from cookies
     */
    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        
        // Try multiple methods to read cookie
        try {
            // Method 1: Direct cookie parsing
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${AUTH_COOKIES.ACCESS_TOKEN}=`);
            if (parts.length === 2) {
                const token = parts.pop()?.split(';').shift()?.trim();
                if (token) return token;
            }

            // Method 2: Regex match
            const cookieMatch = document.cookie.match(
                new RegExp(`(?:^|; )${AUTH_COOKIES.ACCESS_TOKEN}=([^;]*)`),
            );
            if (cookieMatch && cookieMatch[1]) {
                return cookieMatch[1].trim();
            }
        } catch (error) {
            // Cookie reading failed
            if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to read accessToken from cookies:', error);
            }
        }

        return null;
    },

    /**
     * Set profile completion cookie
     */
    setProfileComplete(isComplete: boolean): void {
        if (typeof window === 'undefined') return;
        document.cookie = `${AUTH_COOKIES.PROFILE_COMPLETE}=${isComplete}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    },

    /**
     * Get profile completion status from cookies
     */
    getProfileComplete(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${AUTH_COOKIES.PROFILE_COMPLETE}=`);
            if (parts.length === 2) {
                return parts.pop()?.split(';').shift()?.trim() === 'true';
            }
        } catch {
            // Cookie reading failed
        }
        return false;
    },

    /**
     * Clear all auth cookies
     */
    clearAll(): void {
        if (typeof window === 'undefined') return;
        const expireDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
        Object.values(AUTH_COOKIES).forEach((cookieName) => {
            document.cookie = `${cookieName}=; path=/; expires=${expireDate}`;
        });
    },
};
