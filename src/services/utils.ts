//src/services/utils.ts
import { env } from '@/config/env';

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
            const value = `; ${document.cookie}`;
            const parts = value.split(`; accessToken=`);
            if (parts.length === 2) token = parts.pop()?.split(';').shift();
        }

        // Only use customer token from cookies (no fallback)
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    return headers;
}
