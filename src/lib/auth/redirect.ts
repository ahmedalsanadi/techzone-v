/**
 * Build auth page URL with optional step and redirect param.
 * Used by RouteGuard and any flow that sends users to /auth.
 */
export function buildAuthRedirect(
    pathname: string | null | undefined,
    step?: 'signup',
): string {
    const base = '/auth';
    const params = new URLSearchParams();

    if (step) params.set('step', step);
    if (pathname?.trim()) params.set('redirect', pathname.trim());

    const query = params.toString();
    return query ? `${base}?${query}` : base;
}
