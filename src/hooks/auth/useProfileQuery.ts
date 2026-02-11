'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import { useAuthStore } from '@/store/useAuthStore';
import type { CustomerProfile, ProfileUpdateRequest } from '@/types/auth';

export const profileQueryKey = ['profile'] as const;

export function useProfileQuery(options: {
    enabled: boolean;
    initialData?: CustomerProfile | null;
} = { enabled: false }) {
    const { enabled, initialData } = options;

    return useQuery({
        queryKey: profileQueryKey,
        queryFn: () => storeService.getProfile(),
        enabled,
        initialData: initialData ?? undefined,
        staleTime: 2 * 60 * 1000,
    });
}

export function useProfileUpdateMutation() {
    const queryClient = useQueryClient();
    const { setProfile } = useAuthStore();

    return useMutation({
        mutationFn: (data: ProfileUpdateRequest) =>
            storeService.updateProfile(data),
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(profileQueryKey, updatedProfile);
            setProfile(updatedProfile);
        },
    });
}
