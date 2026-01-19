'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/store-service';
import { toast } from 'sonner';

interface RouteGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireProfileComplete?: boolean;
}

/**
 * Client-side route guard that checks authentication and profile completion
 * Handles all edge cases like:
 * - User not authenticated trying to access protected routes
 * - User authenticated but profile incomplete
 * - User trying to access auth pages when already authenticated
 */
export default function RouteGuard({ 
    children, 
    requireAuth = false,
    requireProfileComplete = false,
}: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, token, checkProfileComplete, setProfile } = useAuthStore();

    useEffect(() => {
        const checkAccess = async () => {
            // Check if this is an auth page
            const isAuthPage = pathname?.includes('/auth');

            // If user is authenticated and profile is complete, redirect from auth pages
            if (isAuthPage && isAuthenticated && checkProfileComplete()) {
                router.replace('/' as any);
                return;
            }

            // If route requires auth but user is not authenticated
            if (requireAuth && !isAuthenticated) {
                // Use pathname from i18n router (already normalized, no locale prefix)
                const redirectPath = pathname ? encodeURIComponent(pathname) : '';
                if (redirectPath) {
                    router.replace(`/auth?redirect=${redirectPath}` as any);
                } else {
                    router.replace('/auth' as any);
                }
                return;
            }

            // If route requires profile completion
            if (requireProfileComplete && isAuthenticated) {
                // Try to load profile if we have token but no profile data
                if (token && !checkProfileComplete()) {
                    try {
                        const profile = await storeService.getProfile();
                        setProfile(profile);
                        
                        if (!profile.is_profile_complete) {
                            const redirectPath = pathname ? encodeURIComponent(pathname) : '';
                            if (redirectPath) {
                                router.replace(`/auth?step=signup&redirect=${redirectPath}` as any);
                            } else {
                                router.replace('/auth?step=signup' as any);
                            }
                            toast.info('يجب إكمال الملف الشخصي للمتابعة');
                            return;
                        }
                    } catch (error) {
                        // If profile fetch fails, redirect to auth
                        console.error('Failed to load profile:', error);
                        const redirectPath = pathname ? encodeURIComponent(pathname) : '';
                        if (redirectPath) {
                            router.replace(`/auth?redirect=${redirectPath}` as any);
                        } else {
                            router.replace('/auth' as any);
                        }
                        return;
                    }
                } else if (!checkProfileComplete()) {
                    // Profile is not complete
                    const redirectPath = pathname ? encodeURIComponent(pathname) : '';
                    if (redirectPath) {
                        router.replace(`/auth?step=signup&redirect=${redirectPath}` as any);
                    } else {
                        router.replace('/auth?step=signup' as any);
                    }
                    toast.info('يجب إكمال الملف الشخصي للمتابعة');
                    return;
                }
            }
        };

        checkAccess();
    }, [isAuthenticated, token, checkProfileComplete, requireAuth, requireProfileComplete, pathname, router, setProfile]);

    // Don't render children if redirecting
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (requireProfileComplete && isAuthenticated && !checkProfileComplete()) {
        return null;
    }

    return <>{children}</>;
}
