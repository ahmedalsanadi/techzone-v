import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAddresses, useAddressMutations } from './useAddresses';
import {
    Address,
    AddressFormSubmitPayload,
    toCreateAddressRequest,
    toUpdateAddressRequest,
    normalizeAddress,
} from '@/types/address';
import { GUEST_ADDRESS_ID } from '@/lib/address/constants';

/**
 * Unified hook for address operations.
 * Highly optimized for performance and senior-grade clean code.
 */
export function useAddressFlow() {
    const { isAuthenticated } = useAuthStore();
    const { guestAddress, setGuestAddress } = useAddressStore();
    const { setDeliveryAddress } = useOrderStore();

    // Auth-only fetches
    const {
        data: authAddresses = [],
        isLoading: isLoadingAuth,
        isError: isErrorAuth,
        refetch,
    } = useAddresses();
    const { createAddress, updateAddress, deleteAddress, setDefaultAddress } =
        useAddressMutations();

    // Memoized addresses to prevent unnecessary re-computations or child re-renders
    const addresses = useMemo(() => {
        if (isAuthenticated) {
            return authAddresses;
        }
        return guestAddress ? [normalizeAddress(guestAddress)!] : [];
    }, [isAuthenticated, authAddresses, guestAddress]);

    const isLoading = isAuthenticated ? isLoadingAuth : false;
    const isError = isAuthenticated ? isErrorAuth : false;

    const saveAddress = async (
        payload: AddressFormSubmitPayload,
        editingId?: number,
    ) => {
        if (isAuthenticated) {
            const raw = editingId
                ? await updateAddress.mutateAsync({
                      id: editingId,
                      data: toUpdateAddressRequest(payload),
                  })
                : await createAddress.mutateAsync(
                      toCreateAddressRequest(payload),
                  );

            return normalizeAddress(raw);
        } else {
            // Guest Flow: Instant local update
            const newAddress = normalizeAddress({
                ...payload,
                id: GUEST_ADDRESS_ID,
            } as Address)!;

            setGuestAddress(newAddress);
            return newAddress;
        }
    };

    const deleteAddressOp = async (id: number) => {
        if (isAuthenticated) {
            return deleteAddress.mutateAsync(id);
        } else {
            if (id === GUEST_ADDRESS_ID) {
                setGuestAddress(null);
            }
            return null;
        }
    };

    const setDefault = async (address: Address) => {
        if (isAuthenticated) {
            return setDefaultAddress.mutateAsync(address);
        }
        return null;
    };

    return {
        addresses,
        isLoading,
        isError,
        refetch,
        isAuthenticated,
        saveAddress,
        deleteAddress: deleteAddressOp,
        setDefault,
    };
}
