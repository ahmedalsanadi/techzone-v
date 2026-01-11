// src/app/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

    const headers = await getBaseHeaders(
        request.headers.get('Accept-Language') || 'ar',
        request.headers.get('Content-Type'),
    );

    let body: BodyInit | undefined;
    if (!['GET', 'HEAD'].includes(method)) {
        try {
            body = await request.arrayBuffer();
        } catch {
            /* No-op */
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
        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type':
                    response.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        );
    }
}

export const GET = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) =>
    handleRequest(req, params, 'GET');
export const POST = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) =>
    handleRequest(req, params, 'POST');
export const PUT = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) =>
    handleRequest(req, params, 'PUT');
export const PATCH = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) =>
    handleRequest(req, params, 'PATCH');
export const DELETE = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) =>
    handleRequest(req, params, 'DELETE');
