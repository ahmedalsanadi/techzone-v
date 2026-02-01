/**
 * React Query hooks for managing customer addresses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import {
    Address,
    CreateAddressRequest,
    UpdateAddressRequest,
    normalizeAddress,
} from '@/types/address';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { getNextDeliveryAddressAfterMutation } from '@/lib/address';

/**
 * Hook to fetch all addresses for the authenticated user
 */
export function useAddresses() {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['addresses'],
        queryFn: () => storeService.getAddresses(),
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch a single address by ID
 * Note: Use this rarely, as useAddresses() already provides full data.
 */
export function useAddress(id: number | null) {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['address', id],
        queryFn: () => storeService.getAddress(id!),
        enabled: isAuthenticated && id !== null,
        staleTime: 1000 * 60 * 10,
    });
}

/**
 * Hook for address mutations (create, update, delete).
 */
export function useAddressMutations() {
    const queryClient = useQueryClient();
    const { setDeliveryAddress } = useOrderStore();

    const createMutation = useMutation({
        mutationFn: (data: CreateAddressRequest) =>
            storeService.createAddress(data),
        onMutate: async (newAddressBatch) => {
            await queryClient.cancelQueries({ queryKey: ['addresses'] });
            const previousAddresses = queryClient.getQueryData<Address[]>([
                'addresses',
            ]);

            const tempAddress = {
                ...newAddressBatch,
                id: -Date.now(),
                is_default: !!newAddressBatch.is_default,
            } as Address;

            queryClient.setQueryData(['addresses'], (old: Address[] = []) => [
                tempAddress,
                ...old,
            ]);

            return { previousAddresses };
        },
        onError: (err, newAddress, context) => {
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (newAddress) => {
            queryClient.setQueryData(['addresses'], (old: Address[] = []) => {
                const updatedList = old.map((a) => (a.id < 0 ? newAddress : a));
                if (newAddress.is_default) {
                    return updatedList.map((a) => ({
                        ...a,
                        is_default: Number(a.id) === Number(newAddress.id),
                    }));
                }
                return updatedList;
            });

            queryClient.invalidateQueries({ queryKey: ['addresses'] });

            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'created',
                currentDeliveryAddress: current,
                newAddress,
            });
            setDeliveryAddress(normalizeAddress(next));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateAddressRequest;
        }) => storeService.updateAddress(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['addresses'] });
            const previousAddresses = queryClient.getQueryData<Address[]>([
                'addresses',
            ]);

            queryClient.setQueryData(['addresses'], (old: Address[] = []) =>
                old.map((a) =>
                    Number(a.id) === id ? ({ ...a, ...data } as Address) : a,
                ),
            );

            return { previousAddresses };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (updatedAddress) => {
            queryClient.setQueryData(['addresses'], (old: Address[] = []) => {
                const updatedList = old.map((a) =>
                    Number(a.id) === Number(updatedAddress.id)
                        ? updatedAddress
                        : a,
                );
                if (updatedAddress.is_default) {
                    return updatedList.map((a) => ({
                        ...a,
                        is_default: Number(a.id) === Number(updatedAddress.id),
                    }));
                }
                return updatedList;
            });

            queryClient.setQueryData(
                ['address', updatedAddress.id],
                updatedAddress,
            );
            queryClient.invalidateQueries({ queryKey: ['addresses'] });

            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'updated',
                currentDeliveryAddress: current,
                updatedAddress,
            });
            setDeliveryAddress(normalizeAddress(next));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => storeService.deleteAddress(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['addresses'] });
            const previousAddresses = queryClient.getQueryData<Address[]>([
                'addresses',
            ]);

            queryClient.setQueryData(['addresses'], (old: Address[] = []) =>
                old.filter((a) => Number(a.id) !== id),
            );

            return { previousAddresses };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'deleted',
                currentDeliveryAddress: current,
                deletedId,
            });
            setDeliveryAddress(normalizeAddress(next));
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (address: Address) =>
            storeService.updateAddress(address.id, {
                ...address,
                district_id: address.district_id ?? undefined,
                building: address.building ?? undefined,
                unit: address.unit ?? undefined,
                postal_code: address.postal_code ?? undefined,
                additional_number: address.additional_number ?? undefined,
                description: address.description ?? undefined,
                latitude: Number(address.latitude),
                longitude: Number(address.longitude),
                is_default: true,
            }),
        onMutate: async (target) => {
            await queryClient.cancelQueries({ queryKey: ['addresses'] });
            const previousAddresses = queryClient.getQueryData<Address[]>([
                'addresses',
            ]);

            queryClient.setQueryData(['addresses'], (old: Address[] = []) =>
                old.map((a) => ({
                    ...a,
                    is_default: Number(a.id) === target.id,
                })),
            );

            return { previousAddresses };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (updatedAddress) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'set_default',
                currentDeliveryAddress: current,
                updatedAddress,
            });
            setDeliveryAddress(normalizeAddress(next));
        },
    });

    return {
        createAddress: createMutation,
        updateAddress: updateMutation,
        deleteAddress: deleteMutation,
        setDefaultAddress: setDefaultMutation,
    };
}

/**
 * Location Helpers with high staleTime to prevent redundant fetches.
 */
export function useCountries(enabled = true) {
    return useQuery({
        queryKey: ['countries'],
        queryFn: () => storeService.getCountries(),
        enabled: enabled,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useCities(countryId: number | null) {
    return useQuery({
        queryKey: ['cities', countryId],
        queryFn: () => storeService.getCities(countryId!),
        enabled: !!countryId,
        staleTime: 1000 * 60 * 60 * 24,
    });
}

export function useDistricts(cityId: number | null) {
    return useQuery({
        queryKey: ['districts', cityId],
        queryFn: () => storeService.getDistricts(cityId!),
        enabled: !!cityId,
        staleTime: 1000 * 60 * 60 * 24,
    });
}
