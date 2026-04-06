/**
 * Standardize header construction for both server-side and client-side requests.
 *
 * X-Store-Key:
 * - Server-side: injected here from request host (x-forwarded-host or host) + resolveTenant().
 * - Client-side: not set here (never exposed to browser); the proxy route injects it when forwarding to the API.
 *
 * x-branch-id:
 * - Server-side: injected here from request cookies (next/headers cookies()).
 * - Client-side: set here from document.cookie so the request to /proxy carries it; the proxy re-injects it into the outgoing API request.
 */
import { env } from '@/config/env';
import { AUTH_COOKIES } from '@/lib/auth/constants';
import { BRANCH_COOKIES } from '@/lib/branches/constants';
import { resolveTenant } from '@/lib/tenant';

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
        } catch {
            /* No-op */
        }
    } else {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${BRANCH_COOKIES.BRANCH_ID}=`);
            if (parts.length === 2) {
                branchId = parts.pop()?.split(';').shift()?.trim();
            }
        } catch {
            /* No-op */
        }
    }

    if (branchId) {
        headers.set('x-branch-id', branchId);
    }

    // Only add X-Store-Key on server-side
    // On client-side, the proxy will inject it from server env (not exposed to browser)
    if (typeof window === 'undefined') {
        try {
            const { headers: nextHeaders } = await import('next/headers');
            const requestHeaders = await nextHeaders();
            // Match doc: resolve host from x-forwarded-host (first value) or host
            const forwarded = requestHeaders.get('x-forwarded-host');
            const host =
                (forwarded ? forwarded.split(',')[0].trim() : null) ||
                requestHeaders.get('host');
            const { storeKey } = resolveTenant(host);

            if (storeKey) {
                headers.set('X-Store-Key', storeKey);
            }
        } catch {
            const fallbackStoreKey =
                env.storeDefaultKey || env.liberoApiKey || '';
            if (
                (env.isDev || env.allowDefaultStoreKeyInProd) &&
                fallbackStoreKey
            ) {
                headers.set('X-Store-Key', fallbackStoreKey);
            }
        }
    }

    // For multipart/form-data we do not set Content-Type so the browser (or proxy) sets it with boundary
    if (contentType && !contentType.includes('multipart/form-data')) {
        headers.set('Content-Type', contentType);
    } else if (!contentType || contentType === 'application/json') {
        headers.set('Content-Type', 'application/json');
    }

    // Identify platform for backend analytics and API response condition (e.g., Coupons API)
    headers.set('X-Platform', 'web');

    // Only inject Authorization if the route is protected
    // Customer token comes from cookies (set by auth service after login)
    if (isProtected) {
        let token: string | undefined;
        if (typeof window === 'undefined') {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                token = cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
            } catch (e) {
                /* No-op */
                console.error(e);
            }
        } else {
            // Read token from cookies on client-side
            try {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${AUTH_COOKIES.ACCESS_TOKEN}=`);
                if (parts.length === 2) {
                    token =
                        parts.pop()?.split(';').shift()?.trim() || undefined;
                }
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
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    return headers;
}
