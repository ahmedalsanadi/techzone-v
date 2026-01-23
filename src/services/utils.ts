import { env } from '@/config/env';
import { AUTH_COOKIES } from '@/lib/auth/constants';
import { BRANCH_COOKIES } from '@/lib/branches/constants';

/**
 * Standardize header construction for both server-side and client-side requests.
 * Note: X-Store-Key is only added on server-side. On client-side, the proxy will inject it.
 */
export async function getBaseHeaders(
    locale?: string,
    contentType?: string | null,
    isProtected: boolean = false,
) {
    const headers = new Headers({
        Accept: 'application/json',
        'Accept-Language': locale || 'ar',
    });

    // Inject Branch ID if available in cookies
    let branchId: string | undefined;
    if (typeof window === 'undefined') {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            branchId = cookieStore.get(BRANCH_COOKIES.BRANCH_ID)?.value;
        } catch (e) {
            /* No-op */
        }
    } else {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${BRANCH_COOKIES.BRANCH_ID}=`);
            if (parts.length === 2) {
                branchId = parts.pop()?.split(';').shift()?.trim();
            }
        } catch (e) {
            /* No-op */
        }
    }

    if (branchId) {
        headers.set('x-branch-id', branchId);
    }

    // Only add X-Store-Key on server-side
    // On client-side, the proxy will inject it from server env (not exposed to browser)
    if (typeof window === 'undefined') {
        headers.set('X-Store-Key', env.liberoApiKey);
    }

    if (contentType && !contentType.includes('multipart/form-data')) {
        headers.set('Content-Type', contentType);
    } else if (!contentType || contentType === 'application/json') {
        headers.set('Content-Type', 'application/json');
    }

    // Only inject Authorization if the route is protected
    // Customer token comes from cookies (set by auth service after login)
    if (isProtected) {
        let token: string | undefined;
        if (typeof window === 'undefined') {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                token = cookieStore.get('accessToken')?.value;
            } catch (e) {
                /* No-op */
                console.error(e);
            }
        } else {
            // Read token from cookies on client-side
            // Use the same logic as authCookies.getAccessToken() but inline to avoid circular deps
            try {
                // Method 1: Direct cookie parsing
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${AUTH_COOKIES.ACCESS_TOKEN}=`);
                if (parts.length === 2) {
                    token =
                        parts.pop()?.split(';').shift()?.trim() || undefined;
                }

                // Method 2: Regex match if Method 1 didn't work
                if (!token) {
                    const cookieMatch = document.cookie.match(
                        new RegExp(
                            `(?:^|; )${AUTH_COOKIES.ACCESS_TOKEN}=([^;]*)`,
                        ),
                    );
                    if (cookieMatch && cookieMatch[1]) {
                        token = cookieMatch[1].trim();
                    }
                }
            } catch (e) {
                if (env.isDev) {
                    console.warn('Failed to read accessToken from cookies:', e);
                }
            }
        }

        // Only use customer token from cookies (no fallback)
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    return headers;
}
