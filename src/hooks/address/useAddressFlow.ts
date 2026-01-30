'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAddresses, useAddressMutations } from '@/hooks/useAddresses';
import {
    Address,
    AddressFormSubmitPayload,
    toCreateAddressRequest,
    toUpdateAddressRequest,
} from '@/types/address';
import { GUEST_ADDRESS_ID } from '@/lib/address/constants';

/**
 * Unified hook for address operations.
 * Automatically switches between Local (Guest) and Cloud (Auth) storage.
 */
export function useAddressFlow() {
    const { isAuthenticated } = useAuthStore();
    const { guestAddress, setGuestAddress } = useAddressStore();
    const { setDeliveryAddress } = useOrderStore();
    const { data: authAddresses = [], isLoading: isLoadingAuth } =
        useAddresses();
    const { createAddress, updateAddress } = useAddressMutations();

    const addresses = isAuthenticated
        ? authAddresses
        : guestAddress
          ? [guestAddress]
          : [];
    const isLoading = isAuthenticated ? isLoadingAuth : false;

    const saveAddress = async (
        payload: AddressFormSubmitPayload,
        editingId?: number,
    ) => {
        if (isAuthenticated) {
            if (editingId) {
                return updateAddress.mutateAsync({
                    id: editingId,
                    data: toUpdateAddressRequest(payload),
                });
            } else {
                return createAddress.mutateAsync(
                    toCreateAddressRequest(payload),
                );
            }
        } else {
            // Guest Flow
            const newAddress = {
                ...payload,
                id: GUEST_ADDRESS_ID,
            } as Address;
            setGuestAddress(newAddress);
            setDeliveryAddress(newAddress);
            return newAddress;
        }
    };

    return {
        addresses,
        isLoading,
        isAuthenticated,
        saveAddress,
    };
}
