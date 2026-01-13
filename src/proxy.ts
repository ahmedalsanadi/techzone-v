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

    // Redirect to sign-in if protected route and no token
    if (isProtected && !token) {
        // Get locale from pathname or default to ar
        const segments = pathname.split('/');
        const locale =
            segments[1] === 'en' || segments[1] === 'ar' ? segments[1] : 'ar';

        const signInUrl = new URL(`/${locale}/sign-in`, request.url);
        signInUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Handle i18n routing
    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
