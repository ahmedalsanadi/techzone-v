'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useProfileQuery } from '@/hooks/auth';

interface RouteGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireProfileComplete?: boolean;
}

/**
 * Client-side route guard that checks authentication and profile completion.
 * Uses TanStack Query for profile when requireProfileComplete is true.
 */
export default function RouteGuard({
    children,
    requireAuth = false,
    requireProfileComplete = false,
}: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, token, checkProfileComplete, setProfile } =
        useAuthStore();

    const needProfile =
        requireProfileComplete &&
        isAuthenticated &&
        !!token &&
        !checkProfileComplete();
    const profileQuery = useProfileQuery({ enabled: needProfile });

    useEffect(() => {
        const isAuthPage = pathname?.includes('/auth');

        if (isAuthPage && isAuthenticated && checkProfileComplete()) {
            router.replace('/' as any);
            return;
        }

        if (requireAuth && !isAuthenticated) {
            const redirectPath = pathname ? encodeURIComponent(pathname) : '';
            if (redirectPath) {
                router.replace(`/auth?redirect=${redirectPath}` as any);
            } else {
                router.replace('/auth' as any);
            }
            return;
        }

        if (!requireProfileComplete) return;

        if (!isAuthenticated) return;

        if (profileQuery.data) {
            setProfile(profileQuery.data);
            if (!profileQuery.data.is_profile_complete) {
                const redirectPath = pathname
                    ? encodeURIComponent(pathname)
                    : '';
                if (redirectPath) {
                    router.replace(
                        `/auth?step=signup&redirect=${redirectPath}` as any,
                    );
                } else {
                    router.replace('/auth?step=signup' as any);
                }
                toast.info('يجب إكمال الملف الشخصي للمتابعة');
                return;
            }
            return;
        }

        if (profileQuery.isError) {
            const redirectPath = pathname ? encodeURIComponent(pathname) : '';
            if (redirectPath) {
                router.replace(`/auth?redirect=${redirectPath}` as any);
            } else {
                router.replace('/auth' as any);
            }
            return;
        }

        if (!token || checkProfileComplete()) return;

        if (!profileQuery.isFetching && !profileQuery.data) {
            const redirectPath = pathname ? encodeURIComponent(pathname) : '';
            if (redirectPath) {
                router.replace(
                    `/auth?step=signup&redirect=${redirectPath}` as any,
                );
            } else {
                router.replace('/auth?step=signup' as any);
            }
            toast.info('يجب إكمال الملف الشخصي للمتابعة');
        }
    }, [
        pathname,
        isAuthenticated,
        token,
        checkProfileComplete,
        requireAuth,
        requireProfileComplete,
        router,
        setProfile,
        profileQuery.data,
        profileQuery.isError,
        profileQuery.isFetching,
    ]);

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (
        requireProfileComplete &&
        isAuthenticated &&
        !checkProfileComplete() &&
        !profileQuery.data &&
        profileQuery.isFetching
    ) {
        return null;
    }

    if (
        requireProfileComplete &&
        isAuthenticated &&
        !checkProfileComplete() &&
        profileQuery.data &&
        !profileQuery.data.is_profile_complete
    ) {
        return null;
    }

    return <>{children}</>;
}
