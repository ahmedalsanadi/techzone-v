/**
 * Hook for merging guest address with customer account after authentication
 */

import { useCallback, useRef } from 'react';
import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { normalizeAddress, toCreateAddressRequest } from '@/types/address';
import { useAddressMutations } from '@/hooks/useAddresses';

export function useAddressMerge() {
    const { guestAddress, clearGuestAddress } = useAddressStore();
    const { isAuthenticated } = useAuthStore();
    const { createAddress } = useAddressMutations();
    const hasMergedRef = useRef(false);

    const mergeGuestAddressAfterAuth = useCallback(async () => {
        const normalizedGuest = normalizeAddress(guestAddress);
        if (!isAuthenticated || !normalizedGuest || hasMergedRef.current) return;

        if (
            !normalizedGuest.label ||
            !normalizedGuest.phone ||
            normalizedGuest.country_id == null ||
            normalizedGuest.city_id == null ||
            !normalizedGuest.street ||
            normalizedGuest.latitude == null ||
            normalizedGuest.longitude == null
        ) {
            return;
        }

        try {
            const request = toCreateAddressRequest({
                ...normalizedGuest,
                is_default: true,
            });

            hasMergedRef.current = true;
            await createAddress.mutateAsync(request);
            clearGuestAddress();
        } catch {
            hasMergedRef.current = false;
            // We don't clear here so it can be retried or handled later
        }
    }, [isAuthenticated, guestAddress, clearGuestAddress, createAddress]);

    return { mergeGuestAddressAfterAuth };
}
