//src/services/utils.ts
import { env } from '@/config/env';

/**
 * Helper to get a cookie value by name (client-side).
 */
function getClientCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

/**
 * Standardize header construction for both server-side and client-side requests.
 * Now handles Authorization logic previously done in the proxy.
 */
export async function getBaseHeaders(
    locale?: string,
    contentType?: string | null,
) {
    const headers = new Headers({
        Accept: 'application/json',
        'Accept-Language': locale || 'ar',
        'X-Store-Key': env.liberoApiKey,
    });

    if (contentType && !contentType.includes('multipart/form-data')) {
        headers.set('Content-Type', contentType);
    } else if (!contentType) {
        headers.set('Content-Type', 'application/json');
    }

    // Determine the token to use
    let token: string | undefined;

    if (typeof window === 'undefined') {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            token = cookieStore.get('accessToken')?.value;
        } catch (e) {
            /* No-op */
        }
    } else {
        token = getClientCookie('accessToken');
    }

    // Set Authorization header
    // We ALWAYS want to include the Libero Auth Token if no user token is present
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    } else if (env.liberoAuthToken) {
        headers.set('Authorization', `Bearer ${env.liberoAuthToken}`);
    }

    return headers;
}
