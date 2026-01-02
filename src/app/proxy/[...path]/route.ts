import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

function getApiUrl(): string {
    // Allow server-only fallback for API routes
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return apiUrl;
}

// Default locale for Accept-Language header fallback
const DEFAULT_LOCALE = routing.defaultLocale;
const SECURE_IN_PROD = process.env.NODE_ENV === 'production';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type TokenCookieOptions = {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    maxAge?: number;
    path?: string;
    domain?: string;
    expires?: Date;
};

const HEADER_FORWARD_ALLOWLIST = [
    'Content-Type',
    'Content-Length',
    'Content-Disposition',
    'Cache-Control',
    'ETag',
    'Last-Modified',
] as const;

function parseSetCookieHeader(cookieHeader: string): {
    name: string;
    value: string;
    options: TokenCookieOptions;
} | null {
    const [nameValue, ...attributeParts] = cookieHeader.split(';');
    if (!nameValue) return null;

    const [name, ...valueParts] = nameValue.split('=');
    const value = valueParts.join('=');
    if (!name || !value) return null;

    const options: TokenCookieOptions = {};
    for (const part of attributeParts) {
        const [rawKey, ...rawValueParts] = part.split('=');
        if (!rawKey) continue; // Skip empty parts
        const key = rawKey.trim().toLowerCase();
        const attributeValue = rawValueParts.join('=').trim();

        switch (key) {
            case 'path':
                options.path = attributeValue || undefined;
                break;
            case 'domain':
                options.domain = attributeValue || undefined;
                break;
            case 'httponly':
                options.httpOnly = true;
                break;
            case 'secure':
                options.secure = true;
                break;
            case 'samesite': {
                const sameSiteValue = attributeValue.toLowerCase();
                if (
                    sameSiteValue === 'lax' ||
                    sameSiteValue === 'strict' ||
                    sameSiteValue === 'none'
                ) {
                    options.sameSite = sameSiteValue;
                }
                break;
            }
            case 'max-age': {
                const maxAge = Number.parseInt(attributeValue, 10);
                if (!Number.isNaN(maxAge)) {
                    options.maxAge = maxAge;
                }
                break;
            }
            case 'expires': {
                const expires = new Date(attributeValue);
                if (!Number.isNaN(expires.getTime())) {
                    options.expires = expires;
                }
                break;
            }
            default:
                break;
        }
    }

    return {
        name: name.trim(),
        value: value.trim(),
        options,
    };
}

/**
 * Helper function to apply Set-Cookie header to NextResponse
 * Parses cookie header and sets it with proper options
 */
function applyCookieToResponse(
    nextResponse: NextResponse,
    cookieHeader: string,
): void {
    const parsedCookie = parseSetCookieHeader(cookieHeader);
    if (!parsedCookie) return;

    const { name, value, options } = parsedCookie;

    // Only handle accessToken and refreshToken
    if (name !== 'accessToken' && name !== 'refreshToken') return;

    nextResponse.cookies.set(name, value, {
        httpOnly: options.httpOnly ?? false,
        secure: options.secure || SECURE_IN_PROD,
        sameSite: options.sameSite ?? 'lax',
        maxAge:
            options.maxAge ??
            (name === 'accessToken' ? 60 * 60 : 60 * 60 * 24 * 9),
        path: options.path,
        domain: options.domain,
        expires: options.expires,
    });
}

/**
 * Helper function to forward selected headers from backend response to NextResponse
 */
function forwardHeaders(
    backendResponse: Response,
    nextResponse: NextResponse,
    headerNames: readonly string[] = HEADER_FORWARD_ALLOWLIST,
): void {
    headerNames.forEach((headerName) => {
        const headerValue = backendResponse.headers.get(headerName);
        if (headerValue) {
            nextResponse.headers.set(headerName, headerValue);
        }
    });
}

/**
 * Catch-all proxy route that forwards requests to the backend API
 * Reads accessToken from cookies and forwards with Authorization header
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'POST');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'PATCH');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: HttpMethod,
) {
    const API_URL = getApiUrl();
    try {
        const { path } = await params;
        const pathSegments = Array.isArray(path) ? path : [path];
        const backendPath = `/${pathSegments.join('/')}`;

        // Get query parameters
        const searchParams = request.nextUrl.searchParams.toString();
        const queryString = searchParams ? `?${searchParams}` : '';

        // Read accessToken from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        const acceptLanguage =
            request.headers.get('Accept-Language')?.trim() || DEFAULT_LOCALE;
        const cookieHeader = request.headers.get('Cookie') || '';

        // Prepare headers
        const headers: HeadersInit = {
            'Accept-Language': acceptLanguage,
        };

        // Add Authorization header if token exists
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // Forward Content-Type if present
        const contentType = request.headers.get('Content-Type');
        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        // Get request body for methods that support it
        // Use arrayBuffer to preserve binary data, multipart/form-data, and encoding
        let body: BodyInit | undefined;
        if (method !== 'GET' && method !== 'DELETE') {
            try {
                body = await request.arrayBuffer();
            } catch {
                // No body or already consumed
            }
        }

        // Forward request to backend
        const backendUrl = `${API_URL}${backendPath}${queryString}`;
        let response = await fetch(backendUrl, {
            method,
            headers,
            body,
        });

        // Track if we refreshed tokens (to forward Set-Cookie headers)
        let refreshedTokens = false;
        let refreshCookieHeaders: string[] = [];

        // Handle 401 - attempt refresh
        if (response.status === 401) {
            const refreshResponse = await attemptRefresh(
                request,
                acceptLanguage,
                cookieHeader,
            );
            if (refreshResponse.ok) {
                // Extract Set-Cookie headers
                let setCookieHeaders: string[] = [];

                if (
                    typeof (refreshResponse.headers as any).getSetCookie ===
                    'function'
                ) {
                    // Modern API - returns array of cookie strings
                    setCookieHeaders = (
                        refreshResponse.headers as any
                    ).getSetCookie();
                } else {
                    // Fallback
                    const cookieHeaderValues: string[] = [];
                    for (const [
                        key,
                        value,
                    ] of refreshResponse.headers.entries()) {
                        if (key.toLowerCase() === 'set-cookie') {
                            cookieHeaderValues.push(value);
                        }
                    }

                    for (const headerValue of cookieHeaderValues) {
                        const cookies = headerValue.split(/,\s+(?=[^;]+=)/);
                        setCookieHeaders.push(...cookies);
                    }
                }

                refreshCookieHeaders = setCookieHeaders;
                let newAccessToken: string | null = null;

                for (const cookieHeader of setCookieHeaders) {
                    const match = cookieHeader.match(/^accessToken=([^;]+)/);
                    if (match && match[1]) {
                        newAccessToken = match[1];
                        break;
                    }
                }

                if (newAccessToken) {
                    headers['Authorization'] = `Bearer ${newAccessToken}`;
                    response = await fetch(backendUrl, {
                        method,
                        headers,
                        body,
                    });
                    refreshedTokens = true;
                }
            }
        }

        // Get response body and content type
        const contentTypeHeader = response.headers.get('Content-Type');
        const status = response.status;
        const statusText = response.statusText;

        if (status === 204 || status === 304 || !contentTypeHeader) {
            const nextResponse = new NextResponse(null, {
                status,
                statusText,
            });

            forwardHeaders(response, nextResponse, [
                'Content-Type',
                'Content-Length',
                'Cache-Control',
                'ETag',
            ]);

            if (refreshedTokens && refreshCookieHeaders.length > 0) {
                for (const cookieHeader of refreshCookieHeaders) {
                    applyCookieToResponse(nextResponse, cookieHeader);
                }
            }

            return nextResponse;
        }

        let nextResponse: NextResponse;

        if (contentTypeHeader?.includes('application/json')) {
            const jsonData = await response.json();
            nextResponse = NextResponse.json(jsonData, {
                status,
                statusText,
            });
        } else if (
            contentTypeHeader?.startsWith('text/') ||
            contentTypeHeader?.includes('application/xml') ||
            contentTypeHeader?.includes('application/javascript')
        ) {
            const textData = await response.text();
            nextResponse = new NextResponse(textData, {
                status,
                statusText,
                headers: {
                    'Content-Type': contentTypeHeader,
                },
            });
        } else {
            const arrayBuffer = await response.arrayBuffer();
            nextResponse = new NextResponse(arrayBuffer, {
                status,
                statusText,
                headers: {
                    'Content-Type': contentTypeHeader,
                },
            });
        }

        forwardHeaders(response, nextResponse, [
            'Content-Length',
            'Content-Disposition',
            'Cache-Control',
            'ETag',
            'Last-Modified',
        ]);

        if (refreshedTokens && refreshCookieHeaders.length > 0) {
            for (const cookieHeader of refreshCookieHeaders) {
                applyCookieToResponse(nextResponse, cookieHeader);
            }
        }

        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 },
        );
    }
}

async function attemptRefresh(
    request: NextRequest,
    acceptLanguage: string,
    cookieHeader: string,
): Promise<Response> {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    return fetch(refreshUrl.toString(), {
        method: 'POST',
        headers: {
            'Accept-Language': acceptLanguage,
            Cookie: cookieHeader,
        },
    });
}
