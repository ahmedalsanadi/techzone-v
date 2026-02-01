/**
 * Hook for merging guest address with customer account after authentication
 */

import { useCallback, useRef } from 'react';
import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { normalizeAddress, toCreateAddressRequest } from '@/types/address';
import { useAddressMutations } from '@/hooks/useAddresses';
import { useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import type { Address } from '@/types/address';

const normalizeCoord = (value: string | number) => Number(value).toFixed(5);
const normalizeText = (value: string) => value.trim().toLowerCase();
const normalizeOptionalText = (value?: string | null) =>
    value ? normalizeText(value) : '';

const findMatchingAddress = (list: Address[], target: Address) => {
    const targetStreet = normalizeText(target.street);
    const targetBuilding = normalizeOptionalText(
        target.building_number || target.building || undefined,
    );
    const targetUnit = normalizeOptionalText(
        target.unit_number || target.unit || undefined,
    );
    const targetLat = normalizeCoord(target.latitude);
    const targetLng = normalizeCoord(target.longitude);
    return list.find((addr) => {
        if (!addr.street || addr.latitude == null || addr.longitude == null)
            return false;
        const addrBuilding = normalizeOptionalText(
            addr.building_number || addr.building || undefined,
        );
        const addrUnit = normalizeOptionalText(
            addr.unit_number || addr.unit || undefined,
        );
        return (
            Number(addr.country_id) === Number(target.country_id) &&
            Number(addr.city_id) === Number(target.city_id) &&
            normalizeText(addr.street) === targetStreet &&
            (targetBuilding && addrBuilding
                ? targetBuilding === addrBuilding
                : true) &&
            (targetUnit && addrUnit ? targetUnit === addrUnit : true) &&
            normalizeCoord(addr.latitude) === targetLat &&
            normalizeCoord(addr.longitude) === targetLng
        );
    });
};

export function useAddressMerge() {
    const { guestAddress, clearGuestAddress } = useAddressStore();
    const { isAuthenticated } = useAuthStore();
    const { setDeliveryAddress } = useOrderStore();
    const { createAddress } = useAddressMutations();
    const queryClient = useQueryClient();
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
            const cachedAddresses =
                queryClient.getQueryData<Address[]>(['addresses']);
            let addresses = cachedAddresses;
            if (!addresses) {
                addresses = await queryClient.fetchQuery({
                    queryKey: ['addresses'],
                    queryFn: async () => {
                        const data = await storeService.getAddresses();
                        return data.map((addr) => normalizeAddress(addr)!);
                    },
                    staleTime: 1000 * 60 * 5,
                });
            }

            const normalizedList = addresses?.map(
                (addr) => normalizeAddress(addr)!,
            );
            const match = normalizedList
                ? findMatchingAddress(normalizedList, normalizedGuest)
                : null;
            if (match) {
                setDeliveryAddress(match);
                clearGuestAddress();
                hasMergedRef.current = true;
                return;
            }

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
    }, [
        isAuthenticated,
        guestAddress,
        clearGuestAddress,
        createAddress,
        queryClient,
        setDeliveryAddress,
    ]);

    return { mergeGuestAddressAfterAuth };
}
