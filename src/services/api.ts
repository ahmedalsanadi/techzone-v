//src/services/api.ts
import { env } from '@/config/env';
import { ApiResponse } from './types';
import { getBaseHeaders } from './utils';

/**
 * Custom Error class for API failures.
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function getBaseUrl(): string {
    return env.apiUrl;
}

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
    isProtected?: boolean;
}

export async function fetchLibero<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const result = await fetchLiberoFull<T>(endpoint, options);
    return result.data;
}

export async function fetchLiberoFull<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<ApiResponse<T>> {
    const { params, isProtected, ...init } = options;
    const baseUrl = getBaseUrl();

    // Determine locale
    let locale = 'ar';
    if (typeof window !== 'undefined') {
        locale = document.documentElement.lang || 'ar';
    } else {
        try {
            const { getLocale } = await import('next-intl/server');
            locale = await getLocale();
        } catch {
            /* Default to ar */
        }
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${path}`);

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v != null) url.searchParams.append(k, String(v));
        });
    }

    // Get base headers (X-Store-Key, Accept, etc.)
    const headers = await getBaseHeaders(
        locale,
        (init.headers as Record<string, string>)?.['Content-Type'],
        isProtected,
    );

    // Merge any override headers passed in options
    if (init.headers) {
        const overrideHeaders = new Headers(
            init.headers as Record<string, string>,
        );
        overrideHeaders.forEach((v, k) => headers.set(k, v));
    }

    // Increased timeout for slower backends or cold starts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log(`[API] ${init.method || 'GET'} ${path}`);

    try {
        const response = await fetch(url.toString(), {
            ...init,
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 204) {
            return { success: true, message: '', data: {} as T };
        }

        const contentType = response.headers.get('Content-Type');
        let result: any;

        if (contentType?.includes('application/json')) {
            result = await response.json();
        } else {
            // Fallback for non-JSON responses (like HTML error pages)
            const text = await response.text();
            result = {
                success: response.ok,
                message: text || response.statusText,
                data: null,
            };
        }

        if (!response.ok || !result.success) {
            console.error(`[API Error] ${init.method || 'GET'} ${path}:`, {
                status: response.status,
                message: result.message || 'Unknown Error',
            });

            throw new ApiError(
                response.status,
                result.message || 'Request Failed',
                result.data,
            );
        }

        return result;
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) throw error;

        throw new ApiError(
            error instanceof Error && error.name === 'AbortError' ? 504 : 500,
            error instanceof Error
                ? error.message
                : 'Network error or store unavailable',
        );
    }
}
