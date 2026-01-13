/**
 * Normalizes redirect paths for next-intl router
 * Strips locale prefix if present, as i18n router handles locale automatically
 */
export function normalizeRedirectPath(path: string | null | undefined): string {
    if (!path) return '/';
    
    // Remove leading/trailing slashes and decode
    const decoded = decodeURIComponent(path).trim();
    if (!decoded || decoded === '/') return '/';
    
    // Remove locale prefix if present (e.g., /ar/my-orders -> /my-orders)
    const localePrefixPattern = /^\/(ar|en)(\/|$)/;
    const normalized = decoded.replace(localePrefixPattern, '/');
    
    // Ensure it starts with /
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
