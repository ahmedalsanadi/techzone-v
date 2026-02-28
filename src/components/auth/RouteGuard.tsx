'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useProfileQuery } from '@/hooks/auth';
import { buildAuthRedirect } from '@/lib/auth';

interface RouteGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireProfileComplete?: boolean;
}

/** Pure: should redirect authenticated user away from auth page to home. */
function shouldRedirectAuthPageToHome(
    pathname: string | null | undefined,
    isAuthenticated: boolean,
    checkProfileComplete: () => boolean,
): boolean {
    const isAuthPage = pathname?.includes('/auth');
    return !!(isAuthPage && isAuthenticated && checkProfileComplete());
}

/** Pure: should redirect unauthenticated user to auth. */
function shouldRedirectToAuth(
    requireAuth: boolean,
    isAuthenticated: boolean,
): boolean {
    return requireAuth && !isAuthenticated;
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
    const t = useTranslations('Auth');
    const { isAuthenticated, token, checkProfileComplete, setProfile } =
        useAuthStore();

    const needProfile =
        requireProfileComplete &&
        isAuthenticated &&
        !!token &&
        !checkProfileComplete();
    const profileQuery = useProfileQuery({ enabled: needProfile });

    useEffect(() => {
        if (
            shouldRedirectAuthPageToHome(
                pathname,
                isAuthenticated,
                checkProfileComplete,
            )
        ) {
            router.replace('/');
            return;
        }

        if (shouldRedirectToAuth(requireAuth, isAuthenticated)) {
            router.replace(buildAuthRedirect(pathname ?? undefined));
            return;
        }

        if (!requireProfileComplete) return;
        if (!isAuthenticated) return;

        if (profileQuery.data) {
            setProfile(profileQuery.data);
            if (!profileQuery.data.is_profile_complete) {
                router.replace(
                    buildAuthRedirect(pathname ?? undefined, 'signup'),
                );
                toast.info(t('completeProfileRequired'));
                return;
            }
            return;
        }

        if (profileQuery.isError) {
            router.replace(buildAuthRedirect(pathname ?? undefined));
            return;
        }

        if (!token || checkProfileComplete()) return;

        if (!profileQuery.isFetching && !profileQuery.data) {
            router.replace(
                buildAuthRedirect(pathname ?? undefined, 'signup'),
            );
            toast.info(t('completeProfileRequired'));
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
        t,
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
