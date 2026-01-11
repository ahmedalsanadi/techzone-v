//src/services/utils.ts
import { env } from '@/config/env';

/**
 * Standardize header construction for both server-side and client-side requests.
 */
export async function getBaseHeaders(
    locale?: string,
    contentType?: string | null,
    isProtected: boolean = false,
) {
    const headers = new Headers({
        Accept: 'application/json',
        'Accept-Language': locale || 'ar',
        'X-Store-Key': env.liberoApiKey,
    });

    if (contentType && !contentType.includes('multipart/form-data')) {
        headers.set('Content-Type', contentType);
    } else if (!contentType || contentType === 'application/json') {
        headers.set('Content-Type', 'application/json');
    }

    // Only inject Authorization if the route is protected
    if (isProtected) {
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
            const value = `; ${document.cookie}`;
            const parts = value.split(`; accessToken=`);
            if (parts.length === 2) token = parts.pop()?.split(';').shift();
        }

        // Use user token if available, otherwise fallback to system token
        const finalToken = token || env.liberoAuthToken;
        if (finalToken) {
            headers.set('Authorization', `Bearer ${finalToken}`);
        }
    }

    return headers;
}
