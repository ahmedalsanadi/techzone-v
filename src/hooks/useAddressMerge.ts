/**
 * Hook for merging guest address with customer account after authentication
 */

import { useCallback } from 'react';
import { useAddressStore } from '@/store/useAddressStore';
import { storeService } from '@/services/store-service';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';

export function useAddressMerge() {
    const { guestAddress, clearGuestAddress } = useAddressStore();
    const { isAuthenticated } = useAuthStore();
    const { setDeliveryAddress } = useOrderStore();

    const mergeGuestAddressAfterAuth = useCallback(async () => {
        // Only merge if authenticated and there is a guest address in local storage
        if (!isAuthenticated || !guestAddress) return;

        try {
            console.log(
                '[useAddressMerge] Syncing guest address to account...',
            );

            const payload = {
                label: guestAddress.label || guestAddress.name || 'Home',
                recipient_name: guestAddress.recipient_name || '',
                phone: guestAddress.phone || '',
                country_id: guestAddress.country_id || 1, // Default to SA if missing
                city_id: guestAddress.city_id,
                district_id: guestAddress.district_id ?? undefined,
                street: guestAddress.street || guestAddress.formatted || '',
                latitude: Number(guestAddress.latitude) || 24.7136,
                longitude: Number(guestAddress.longitude) || 46.6753,
                building:
                    guestAddress.building ||
                    guestAddress.building_number ||
                    undefined,
                unit:
                    guestAddress.unit || guestAddress.unit_number || undefined,
                postal_code: guestAddress.postal_code || undefined,
                additional_number: guestAddress.additional_number || undefined,
                description:
                    guestAddress.description || guestAddress.notes || '',
                is_default: true, // Make the guest address default on account
            };

            const createdAddress = await storeService.createAddress(
                payload as any,
            );

            // Sync with order store for display purposes (subheader)
            setDeliveryAddress(createdAddress);

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
