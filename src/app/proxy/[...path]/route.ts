// src/app/proxy/[...path]/route.ts
// Next.js 16 proxy route for API requests
import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/lib/api/headers';
import { env } from '@/config/env';
import { PROTECTED_API_ENDPOINTS, AUTH_COOKIES } from '@/lib/auth';
import { BRANCH_COOKIES } from '@/lib/branches/constants';
import { resolveTenant } from '@/lib/tenant';

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: string,
) {
    const { path } = await params;
    const backendPath = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams.toString();

    // CHECK FOR NOMINATIM CALLS
    const isNominatim = path[0] === 'nominatim';

    // Determine if this endpoint requires authentication
    const isProtected =
        !isNominatim &&
        (PROTECTED_API_ENDPOINTS.some((endpoint) =>
            backendPath.startsWith(endpoint),
        ) ||
            (backendPath.startsWith('/store/reviews') && method !== 'GET'));

    // Get customer token from cookies
    const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

    // If protected endpoint and no token, return 401
    if (isProtected && !token) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 },
        );
    }

    // Build headers: getBaseHeaders (server) adds Accept, Content-Type, and may add branch from request cookies.
    // We then inject X-Store-Key and ensure x-branch-id from incoming request cookies (see below).
    const incomingContentType = request.headers.get('Content-Type');
    const headers = await getBaseHeaders(
        request.headers.get('Accept-Language') || 'ar',
        incomingContentType,
        isProtected,
    );

    if (!isNominatim) {
        // Inject X-Store-Key on the server only (never sent from browser). Resolve tenant from request host.
        const forwarded = request.headers.get('x-forwarded-host');
        const host =
            (forwarded ? forwarded.split(',')[0].trim() : null) ||
            request.headers.get('host');
        const { storeKey } = resolveTenant(host);

        if (!storeKey) {
            return NextResponse.json(
                {
                    message:
                        'Store not resolved for this domain. Provide a valid subdomain or domain mapping.',
                },
                { status: 404 },
            );
        }

        headers.set('X-Store-Key', storeKey);
    } else {
        // Special headers for Nominatim compatibility and policy
        headers.set(
            'User-Agent',
            'Store-Restaurant-App/1.0 (alsanadi.ahmed@gmail.com)',
        );
        // Remove Libero-specific headers for Nominatim requests
        headers.delete('X-Store-Key');
    }

    // CRITICAL: For protected endpoints, ensure Authorization header is set
    // Use the token we already read from cookies (more reliable than getBaseHeaders reading it again)
    if (isProtected && token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // CRITICAL: For multipart/form-data, forward the incoming Content-Type (includes boundary)
    // so the backend can parse the body. getBaseHeaders intentionally does not set Content-Type for multipart.
    if (incomingContentType?.includes('multipart/form-data')) {
        headers.set('Content-Type', incomingContentType);
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
        let targetUrl = '';
        if (isNominatim) {
            const nominatimPath = `/${path.slice(1).join('/')}`;
            targetUrl = `https://nominatim.openstreetmap.org${nominatimPath}${
                searchParams ? `?${searchParams}` : ''
            }`;
            // Policy requirement: add email if not present
            if (!targetUrl.includes('email=')) {
                targetUrl +=
                    (targetUrl.includes('?') ? '&' : '?') +
                    'email=alsanadi.ahmed@gmail.com';
            }
        } else {
            targetUrl = `${env.apiUrl}${backendPath}${
                searchParams ? `?${searchParams}` : ''
            }`;
        }

        // Inject x-branch-id from incoming request cookies (user's branch selection) into the API request
        const branchId = request.cookies.get(BRANCH_COOKIES.BRANCH_ID)?.value;
        if (branchId && !isNominatim) {
            headers.set('x-branch-id', branchId);
        }

        if (env.isDev) {
            console.log(`[Proxy] ${method} -> ${targetUrl}`, {
                isNominatim,
                hasToken: !!token,
                isProtected,
                branchId: !isNominatim ? branchId : undefined,
                authHeader: headers.get('Authorization')
                    ? 'present'
                    : 'missing',
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
