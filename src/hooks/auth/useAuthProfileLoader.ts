/**
 * Hook for loading user profile during auth flow
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { storeService } from '@/services/store-service';
import { useAuthStore } from '@/store/useAuthStore';
import { normalizeRedirectPath } from '@/lib/utils';
import { env } from '@/config/env';
import type { AuthStep, ProfileUpdateRequest } from '@/types/auth';

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

    const loadProfile = useCallback(async () => {
        // Don't load profile if we're on the signup step - user needs to complete it first
        if (step === 'signup' && isNewUser) {
            return;
        }

        try {
            const profile = await storeService.getProfile();
            setProfile(profile);
            if (profile.is_profile_complete) {
                const redirectPath = normalizeRedirectPath(
                    redirectTo || searchParams.get('redirect'),
                );
                router.replace(redirectPath as any);
            } else {
                setFormData((prev: ProfileUpdateRequest) => ({
                    ...prev,
                    email: profile.email || prev.email || '',
                }));
            }
        } catch (error) {
            if (env.isDev) {
                console.error('Failed to load profile:', error);
            }
        }
    }, [
        step,
        isNewUser,
        setProfile,
        redirectTo,
        searchParams,
        router,
        setFormData,
    ]);

    useEffect(() => {
        // Only load profile if:
        // 1. User is authenticated
        // 2. We have a token
        // 3. Profile is not complete
        // 4. User is NOT on signup step (new users need to complete signup first)
        // 5. User is NOT a new user (new users must complete signup before loading profile)
        if (
            isAuthenticated &&
            token &&
            !checkProfileComplete() &&
            step !== 'signup' &&
            !isNewUser
        ) {
            loadProfile();
        }
    }, [
        isAuthenticated,
        token,
        checkProfileComplete,
        loadProfile,
        step,
        isNewUser,
    ]);
}
