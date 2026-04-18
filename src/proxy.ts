// src/proxy.ts
// Next.js 16 proxy pattern for routing and protected routes
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { PROTECTED_ROUTES, AUTH_COOKIES } from '@/lib/auth';

const intlMiddleware = createMiddleware(routing);

/**
 * Next.js 16 proxy pattern - replaces deprecated middleware
 * Handles i18n routing and protected route authentication
 */
export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 🔥 CRITICAL: Handle root path - redirect to default locale
    if (pathname === '/') {
        const defaultLocale = routing.defaultLocale;
        const url = new URL(`/${defaultLocale}`, request.url);
        return NextResponse.redirect(url);
    }
    
    const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

    // Check if the current route is protected
    const isProtected = PROTECTED_ROUTES.some((route) => {
        return (
            pathname === route ||
            pathname.startsWith(`${route}/`) ||
            pathname.match(new RegExp(`^/(ar|en)${route}(/.*|$)`))
        );
    });

    // Skip auth check for auth pages themselves
    const isAuthPage = pathname.includes('/auth');

    // Check profile completion status from cookie
    const isProfileComplete =
        request.cookies.get(AUTH_COOKIES.PROFILE_COMPLETE)?.value === 'true';

    // Redirect to auth if protected route and no token
    if (isProtected && !token && !isAuthPage) {
        const segments = pathname.split('/');
        const locale =
            segments[1] === 'en' || segments[1] === 'ar' ? segments[1] : routing.defaultLocale;

        const authUrl = new URL(`/${locale}/auth`, request.url);
        authUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(authUrl);
    }

    // If user is authenticated but profile is incomplete, redirect to signup step
    if (isProtected && token && !isProfileComplete && !isAuthPage) {
        const segments = pathname.split('/');
        const locale =
            segments[1] === 'en' || segments[1] === 'ar' ? segments[1] : routing.defaultLocale;

        const authUrl = new URL(`/${locale}/auth`, request.url);
        authUrl.searchParams.set('step', 'signup');
        authUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(authUrl);
    }

    // Handle i18n routing
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!api|proxy|_next|_vercel|.*\\..*).*)', '/'],
};