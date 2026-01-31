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
 */
export function useAddress(id: number | null) {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['address', id],
        queryFn: () => storeService.getAddress(id!),
        enabled: isAuthenticated && id !== null,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Prefetch a single address (e.g. on hover before opening edit modal).
 */
export function usePrefetchAddress() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuthStore();

    return (id: number) => {
        if (!isAuthenticated) return;
        queryClient.prefetchQuery({
            queryKey: ['address', id],
            queryFn: () => storeService.getAddress(id),
            staleTime: 1000 * 60 * 10,
        });
    };
}

/**
 * Hook for address mutations (create, update, delete).
 * Uses centralized deliverySync so deliveryAddress is only updated when appropriate.
 */
export function useAddressMutations() {
    const queryClient = useQueryClient();
    const { setDeliveryAddress } = useOrderStore();

    const createMutation = useMutation({
        mutationFn: (data: CreateAddressRequest) =>
            storeService.createAddress(data),
        onMutate: async (newAddressBatch) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['addresses'] });

            // Snapshot previous value
            const previousAddresses = queryClient.getQueryData<Address[]>([
                'addresses',
            ]);

            // Optimistically update (with temp ID)
            const tempAddress = {
                ...newAddressBatch,
                id: -Date.now(), // Temp negative ID
                is_default: !!newAddressBatch.is_default,
            } as Address;

            queryClient.setQueryData(['addresses'], (old: Address[] = []) => [
                tempAddress,
                ...old,
            ]);

            return { previousAddresses };
        },
        onError: (err, newAddress, context) => {
            // Rollback on error
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (newAddress) => {
            // Replace temp item with real one from server
            queryClient.setQueryData(['addresses'], (old: Address[] = []) =>
                old.map((a) => (a.id < 0 ? newAddress : a)),
            );

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

            // Optimistically update the list
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
            // Refine with exact server data
            queryClient.setQueryData(['addresses'], (old: Address[] = []) =>
                old.map((a) =>
                    Number(a.id) === Number(updatedAddress.id)
                        ? updatedAddress
                        : a,
                ),
            );
            queryClient.setQueryData(
                ['address', updatedAddress.id],
                updatedAddress,
            );

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
            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'deleted',
                currentDeliveryAddress: current,
                deletedId,
            });
            setDeliveryAddress(next);
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (id: number) =>
            storeService.updateAddress(id, { is_default: true }),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['addresses'] });
            const previousAddresses = queryClient.getQueryData<Address[]>([
                'addresses',
            ]);

            queryClient.setQueryData(['addresses'], (old: Address[] = []) =>
                old.map((a) => ({
                    ...a,
                    is_default: Number(a.id) === id,
                })),
            );

            return { previousAddresses };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (updatedAddress) => {
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
 * Hook to fetch countries, cities, and districts (often cached longer)
 */
export function useCountries() {
    return useQuery({
        queryKey: ['countries'],
        queryFn: () => storeService.getCountries(),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useCities(countryId: number | null) {
    return useQuery({
        queryKey: ['cities', countryId],
        queryFn: () => storeService.getCities(countryId!),
        enabled: countryId !== null,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useDistricts(cityId: number | null) {
    return useQuery({
        queryKey: ['districts', cityId],
        queryFn: () => storeService.getDistricts(cityId!),
        enabled: cityId !== null,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}
