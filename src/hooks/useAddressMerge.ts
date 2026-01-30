/**
 * Hook for merging guest address with customer account after authentication
 */

import { useCallback } from 'react';
import { useAddressStore } from '@/store/useAddressStore';
import { storeService } from '@/services/store-service';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { normalizeAddress, toCreateAddressRequest } from '@/types/address';

export function useAddressMerge() {
    const { guestAddress, clearGuestAddress } = useAddressStore();
    const { isAuthenticated } = useAuthStore();
    const { setDeliveryAddress } = useOrderStore();

    const mergeGuestAddressAfterAuth = useCallback(async () => {
        const normalizedGuest = normalizeAddress(guestAddress);
        if (!isAuthenticated || !normalizedGuest) return;

        try {
            const request = toCreateAddressRequest({
                ...normalizedGuest,
                is_default: true,
            });

            const createdAddress = await storeService.createAddress(request);

            // Sync with order store for display purposes (subheader)
            setDeliveryAddress(normalizeAddress(createdAddress));

            // Clear local storage after successful sync
            clearGuestAddress();

            console.log(
                '[useAddressMerge] Guest address synced and cleared from local storage.',
            );
        } catch (error) {
            console.error(
                '[useAddressMerge] Failed to sync guest address:',
                error,
            );
            // We don't clear here so it can be retried or handled later
        }
    }, [isAuthenticated, guestAddress, clearGuestAddress, setDeliveryAddress]);

    return { mergeGuestAddressAfterAuth };
}
