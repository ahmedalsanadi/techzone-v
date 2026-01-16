// src/proxy.ts
// Next.js 16 proxy pattern for routing and protected routes
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/my-orders', '/payment', '/profile', '/checkout'];
const intlMiddleware = createMiddleware(routing);

/**
 * Next.js 16 proxy pattern - replaces deprecated middleware
 * Handles i18n routing and protected route authentication
 */
export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('accessToken')?.value;

    // Check if the current route is protected
    // We check both with and without locale prefix
    const isProtected = protectedRoutes.some((route) => {
        return (
            pathname === route ||
            pathname.startsWith(`${route}/`) ||
            pathname.match(new RegExp(`^/(ar|en)${route}(/.*|$)`))
        );
    });

    // Skip auth check for auth pages themselves
    const isAuthPage = pathname.includes('/auth');

    // Check profile completion status from cookie
    const isProfileComplete = request.cookies.get('isProfileComplete')?.value === 'true';

    // Redirect to auth if protected route and no token
    if (isProtected && !token && !isAuthPage) {
        // Get locale from pathname or default to ar
        const segments = pathname.split('/');
        const locale =
            segments[1] === 'en' || segments[1] === 'ar' ? segments[1] : 'ar';

        const authUrl = new URL(`/${locale}/auth`, request.url);
        authUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(authUrl);
    }

    // If user is authenticated but profile is incomplete, redirect to signup step
    if (isProtected && token && !isProfileComplete && !isAuthPage) {
        // Get locale from pathname or default to ar
        const segments = pathname.split('/');
        const locale =
            segments[1] === 'en' || segments[1] === 'ar' ? segments[1] : 'ar';

        const authUrl = new URL(`/${locale}/auth`, request.url);
        authUrl.searchParams.set('step', 'signup');
        authUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(authUrl);
    }

    // Handle i18n routing
    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/proxy`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|proxy|_next|_vercel|.*\\..*).*)'],
};
