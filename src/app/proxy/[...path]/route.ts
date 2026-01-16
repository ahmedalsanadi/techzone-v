// src/app/proxy/[...path]/route.ts
// Next.js 16 proxy route for API requests
import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/services/utils';
import { env } from '@/config/env';

// Protected API endpoints that require customer authentication
const protectedEndpoints = [
    '/auth/store/me',
    '/auth/store/logout',
    '/store/orders',
    '/store/wishlist',
    '/store/profile',
    '/store/profile/update',
];

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: string,
) {
    const { path } = await params;
    const backendPath = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams.toString();

    // Determine if this endpoint requires authentication
    const isProtected = protectedEndpoints.some((endpoint) =>
        backendPath.startsWith(endpoint),
    );

    // Get customer token from cookies
    const token = request.cookies.get('accessToken')?.value;

    // If protected endpoint and no token, return 401
    if (isProtected && !token) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 },
        );
    }

    // Get headers from client request (Accept-Language, Content-Type, etc.)
    // But we'll inject X-Store-Key from server env (not from client)
    const headers = await getBaseHeaders(
        request.headers.get('Accept-Language') || 'ar',
        request.headers.get('Content-Type'),
        isProtected,
    );

    // Always inject X-Store-Key from server-side env (never from client)
    // This ensures the API key is never exposed in browser devtools
    headers.set('X-Store-Key', env.liberoApiKey);

    // CRITICAL: For protected endpoints, ensure Authorization header is set
    // Use the token we already read from cookies (more reliable than getBaseHeaders reading it again)
    if (isProtected && token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    let body: BodyInit | undefined;
    if (!['GET', 'HEAD'].includes(method)) {
        try {
            body = await request.arrayBuffer();
        } catch {
            /* No-op */
        }
    }

    try {
        const targetUrl = `${env.apiUrl}${backendPath}${
            searchParams ? `?${searchParams}` : ''
        }`;

        if (env.isDev) {
            console.log(`[Proxy] ${method} -> ${targetUrl}`, {
                hasToken: !!token,
                isProtected,
                authHeader: headers.get('Authorization') ? 'present' : 'missing',
            });
        }

        const response = await fetch(targetUrl, { method, headers, body });

        if (env.isDev) {
            console.log(
                `[Proxy Response] ${
                    response.status
                } <- ${targetUrl} (${response.headers.get('Content-Type')})`,
            );
        }

        if (response.status === 204 || response.status === 304) {
            return new NextResponse(null, { status: response.status });
        }

        const data = await response.arrayBuffer();
        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type':
                    response.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error(`[Proxy Error] ${method} ${backendPath}:`, error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        );
    }
}

export const GET = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'GET');
export const POST = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'POST');
export const PUT = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'PUT');
export const PATCH = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'PATCH');
export const DELETE = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'DELETE');
