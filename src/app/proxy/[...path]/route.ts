// src/app/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBaseHeaders } from '@/services/utils';
import { env } from '@/config/env';

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: string,
) {
    const { path } = await params;

    const backendPath = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const cookieStore = await cookies();

    // Prepare Headers using Shared Logic
    const headers = await getBaseHeaders(
        cookieStore.get('NEXT_LOCALE')?.value ||
            request.headers.get('Accept-Language') ||
            undefined,
        request.headers.get('Content-Type'),
    );

    let body: BodyInit | undefined;
    if (!['GET', 'HEAD'].includes(method)) {
        try {
            body = await request.arrayBuffer();
        } catch {
            /* Suppress */
        }
    }

    try {
        const response = await fetch(
            `${env.apiUrl}${backendPath}${
                searchParams ? `?${searchParams}` : ''
            }`,
            { method, headers, body },
        );

        if (response.status === 204 || response.status === 304) {
            return new NextResponse(null, { status: response.status });
        }

        const data = await response.arrayBuffer();
        const nextResponse = new NextResponse(data, {
            status: response.status,
        });

        ['Content-Type', 'Cache-Control', 'ETag'].forEach((h) => {
            const val = response.headers.get(h);
            if (val) nextResponse.headers.set(h, val);
        });

        return nextResponse;
    } catch (error) {
        console.error(`[Proxy Error] ${method} ${backendPath}:`, error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        );
    }
}

const createMethod =
    (method: string) =>
    (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) =>
        handleRequest(req, params, method);

export const GET = createMethod('GET');
export const POST = createMethod('POST');
export const PUT = createMethod('PUT');
export const PATCH = createMethod('PATCH');
export const DELETE = createMethod('DELETE');
