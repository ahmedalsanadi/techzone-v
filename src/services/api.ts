//src/services/api.ts
import { env } from '@/config/env';
import { ApiResponse } from './types';
import { getBaseHeaders } from './utils';
import { parseDomainMap, resolveStoreKeyFromHost } from '@/lib/tenant';

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
    // On client-side, use proxy to hide API key from browser devtools
    // On server-side, use direct API URL
    //The key idea: The browser has window. The server does not.
    if (typeof window !== 'undefined') {
        return '/proxy';
    }
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
    if (env.isDev) {
        console.log('result', result);
    }
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

    // Handle relative URLs (proxy) vs absolute URLs (direct API)
    let url: URL;
    if (baseUrl.startsWith('/')) {
        // Relative URL (proxy) - construct relative path
        url = new URL(
            `${baseUrl}${path}`,
            typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost',
        );
    } else {
        // Absolute URL (direct API)
        url = new URL(`${baseUrl}${path}`);
    }
    

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

    if (env.isDev) {
        console.log('headers after override headers are set ', headers);
        console.log(`[API] ${init.method || 'GET'} ${path}`);
    }

    // Increased timeout for slower backends or cold starts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const initWithNext = init as RequestInit & {
            next?: { revalidate?: number; tags?: string[] };
        };
        let nextOptions = initWithNext.next ? { ...initWithNext.next } : undefined;

        if (typeof window === 'undefined') {
            try {
                const { headers: nextHeaders } = await import('next/headers');
                const requestHeaders = await nextHeaders();
                const host = requestHeaders.get('host');
                const { storeKey } = resolveStoreKeyFromHost(host, {
                    defaultStoreKey: env.storeDefaultKey || env.liberoApiKey,
                    domainMap: parseDomainMap(env.storeDomainMap),
                    allowDefault: env.isDev || env.allowDefaultStoreKeyInProd,
                });

                if (storeKey) {
                    const existingTags = nextOptions?.tags || [];
                    const tenantTag = `tenant:${storeKey}`;
                    nextOptions = {
                        ...(nextOptions || {}),
                        tags: Array.from(new Set([...existingTags, tenantTag])),
                    };
                }
            } catch {
                /* No-op */
            }
        }

        const response = await fetch(url.toString(), {
            ...init,
            headers,
            signal: controller.signal,
            ...(nextOptions ? { next: nextOptions } : {}),
        });
        clearTimeout(timeoutId);

        if (response.status === 204) {
            return { success: true, message: '', data: {} as T };
        }

        const contentType = response.headers.get('Content-Type');
        let result: ApiResponse<T> | null = null;

        // Check if response is JSON
        if (contentType?.includes('application/json')) {
            try {
                const jsonData = await response.json();
                result = jsonData as ApiResponse<T>;
                
                // Validate result structure
                if (!result || typeof result !== 'object') {
                    throw new ApiError(
                        response.status,
                        'Invalid response structure from server',
                        { received: jsonData },
                    );
                }
            } catch (parseError) {
                // If JSON parsing fails, try to read as text for debugging
                if (parseError instanceof ApiError) {
                    throw parseError;
                }
                
                try {
                    const clonedResponse = response.clone();
                    const text = await clonedResponse.text();
                    throw new ApiError(
                        response.status,
                        'Invalid JSON response from server',
                        { raw: text.substring(0, 200), parseError: parseError instanceof Error ? parseError.message : String(parseError) },
                    );
                } catch (cloneError) {
                    // If clone also fails, throw generic error
                    throw new ApiError(
                        response.status,
                        'Invalid JSON response from server',
                        { raw: 'Unable to read response body', parseError: parseError instanceof Error ? parseError.message : String(parseError) },
                    );
                }
            }
        } else {
            // Non-JSON response (HTML, text, etc.) - this is an error
            // Read directly as text (no need to clone for non-JSON)
            const text = await response.text();
            // Try to extract error message from HTML if possible
            const errorMatch =
                text.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                text.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                text.match(/<body[^>]*>([^<]+)<\/body>/i);
            const errorMessage = errorMatch
                ? errorMatch[1]
                : `Server returned non-JSON response (${
                      contentType || 'unknown type'
                  })`;

            // Always throw error for non-JSON responses, even if status is 200
            const errorDetails = {
                status: response.status,
                message: errorMessage,
                contentType,
                url: url.toString(),
            };

            if (env.isDev) {
                console.error(
                    `[API Error] ${init.method || 'GET'} ${path}:`,
                    errorDetails,
                );
            }

            throw new ApiError(
                response.status === 200 ? 500 : response.status, // Treat 200 HTML as 500 error
                errorMessage,
                { ...errorDetails, raw: text.substring(0, 500) },
            );
        }

        // Check if API response indicates failure
        // Note: result.data can be null (e.g., logout endpoint), which is valid
        if (!response.ok || !result || !result.success) {
            const errorMessage = result?.message || `Request failed with status ${response.status}`;
            
            if (env.isDev) {
                console.error(`[API Error] ${init.method || 'GET'} ${path}:`, {
                    status: response.status,
                    statusText: response.statusText,
                    message: errorMessage,
                    contentType,
                    hasResult: !!result,
                    resultSuccess: result?.success,
                    resultMessage: result?.message,
                    url: url.toString(),
                });
            }

            throw new ApiError(
                response.status,
                errorMessage,
                result?.data,
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
