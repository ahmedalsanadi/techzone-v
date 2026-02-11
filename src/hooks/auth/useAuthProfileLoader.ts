/**
 * Hook for loading user profile during auth flow (uses TanStack Query).
 */

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { normalizeRedirectPath } from '@/lib/utils';
import type { AuthStep, ProfileUpdateRequest } from '@/types/auth';
import { useProfileQuery } from './useProfileQuery';

interface UseAuthProfileLoaderOptions {
    step: AuthStep;
    isAuthenticated: boolean;
    isNewUser: boolean;
    token: string | null;
    checkProfileComplete: () => boolean;
    setFormData: (
        data:
            | ProfileUpdateRequest
            | ((prev: ProfileUpdateRequest) => ProfileUpdateRequest),
    ) => void;
    redirectTo?: string;
}

export function useAuthProfileLoader({
    step,
    isAuthenticated,
    isNewUser,
    token,
    checkProfileComplete,
    setFormData,
    redirectTo,
}: UseAuthProfileLoaderOptions) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setProfile } = useAuthStore();

    const enabled =
        !!isAuthenticated &&
        !!token &&
        !checkProfileComplete() &&
        step !== 'signup' &&
        !isNewUser;

    const profileQuery = useProfileQuery({ enabled });

    useEffect(() => {
        const data = profileQuery.data;
        if (!data) return;

        setProfile(data);
        if (data.is_profile_complete) {
            const redirectPath = normalizeRedirectPath(
                redirectTo || searchParams.get('redirect'),
            );
            router.replace(redirectPath as any);
        } else {
            setFormData((prev: ProfileUpdateRequest) => ({
                ...prev,
                email: data.email || prev.email || '',
            }));
        }
    }, [
        profileQuery.data,
        setProfile,
        redirectTo,
        searchParams,
        router,
        setFormData,
    ]);
}
