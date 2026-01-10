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

/**
 * Returns the base URL for API requests.
 * Now points directly to the backend since proxy is removed for performance.
 */
export function getBaseUrl(): string {
    return env.apiUrl;
}

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

/**
 * Core fetch wrapper for the Libero API.
 */
export async function fetchLibero<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const result = await fetchLiberoFull<T>(endpoint, options);
    return result.data;
}

/**
 * Fetch wrapper that returns the full ApiResponse structure.
 * Useful when pagination meta is needed.
 */
export async function fetchLiberoFull<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<ApiResponse<T>> {
    const { params, ...init } = options;
    const baseUrl = getBaseUrl();

    let locale: string | undefined;
    if (typeof window === 'undefined') {
        try {
            const { getLocale } = await import('next-intl/server');
            locale = await getLocale();
        } catch {
            /* No-op */
        }
    } else {
        locale = document.documentElement.lang;
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${path}`);

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v != null) url.searchParams.append(k, String(v));
        });
    }

    const headers = await getBaseHeaders(
        locale,
        (init.headers as Record<string, string> | undefined)?.['Content-Type'],
    );

    if (init.headers) {
        new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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

        const result: ApiResponse<T> = await response.json();

        if (!response.ok || !result.success) {
            throw new ApiError(
                response.status,
                result.message || 'API Request Failed',
                result.data,
            );
        }

        return result;
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) throw error;

        if (error instanceof Error && error.name === 'AbortError') {
            // Timeouts are handled gracefully by React Query with retry logic
            // No need to log to console - React Query will show user-friendly error messages
            // This keeps console clean for presentations
            throw new ApiError(
                504,
                'Request timed out - the server is taking too long to respond',
            );
        }

        // Only log unexpected errors (not timeouts) in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`[API Error] ${endpoint}:`, error);
        }
        throw new ApiError(
            500,
            error instanceof Error
                ? error.message
                : 'Network error or server unavailable',
        );
    }
}
