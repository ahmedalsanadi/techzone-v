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
        select: (data) => data.map((a) => normalizeAddress(a)!),
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
        select: (data) => normalizeAddress(data),
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

    const toUpdateRequestFromAddress = (
        address: Address,
    ): UpdateAddressRequest => ({
        label: address.label,
        recipient_name: address.recipient_name,
        phone: address.phone,
        country_id: Number(address.country_id),
        city_id: Number(address.city_id),
        district_id: address.district_id ?? undefined,
        street: address.street,
        latitude: Number(address.latitude),
        longitude: Number(address.longitude),
        building_number:
            address.building || address.building_number || undefined,
        unit_number: address.unit || address.unit_number || undefined,
        postal_code: address.postal_code || undefined,
        additional_number: address.additional_number || undefined,
        notes: address.description || address.notes || undefined,
        is_default: true,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateAddressRequest) =>
            storeService.createAddress(data),
        onMutate: async (newAddressBatch) => {
            await queryClient.cancelQueries({ queryKey: ['addresses'] });
            const previousAddresses = queryClient.getQueryData<Address[]>([
                'addresses',
            ]);

            const tempAddress = normalizeAddress({
                ...newAddressBatch,
                id: -Date.now(),
                is_default: !!newAddressBatch.is_default,
            } as Address)!;

            queryClient.setQueryData(['addresses'], (old: Address[] = []) => [
                tempAddress,
                ...old,
            ]);

            return { previousAddresses };
        },
        onError: (err, newAddress, context) => {
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (newAddress, variables) => {
            const merged = {
                ...newAddress,
                building_number:
                    newAddress.building_number ??
                    variables.building_number ??
                    null,
                unit_number:
                    newAddress.unit_number ?? variables.unit_number ?? null,
                notes: newAddress.notes ?? variables.notes ?? null,
            };
            const normalized = normalizeAddress(merged as Address) || merged;
            queryClient.setQueryData(['addresses'], (old: Address[] = []) => {
                const updatedList = old.map((a) =>
                    a.id < 0 ? normalized : a,
                );
                if (normalized.is_default) {
                    return updatedList.map((a) => ({
                        ...a,
                        is_default: Number(a.id) === Number(normalized.id),
                    }));
                }
                return updatedList;
            });

            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'created',
                currentDeliveryAddress: current,
                newAddress: normalized,
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
                old.map((a) => {
                    if (Number(a.id) !== id) return a;
                    return (
                        normalizeAddress({ ...a, ...data } as Address) || a
                    );
                }),
            );

            return { previousAddresses };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['addresses'], context?.previousAddresses);
        },
        onSuccess: (updatedAddress, variables) => {
            const merged = {
                ...updatedAddress,
                building_number:
                    updatedAddress.building_number ??
                    variables.data.building_number ??
                    null,
                unit_number:
                    updatedAddress.unit_number ??
                    variables.data.unit_number ??
                    null,
                notes:
                    updatedAddress.notes ?? variables.data.notes ?? null,
            };
            const normalized = normalizeAddress(merged as Address) || merged;
            queryClient.setQueryData(['addresses'], (old: Address[] = []) => {
                const updatedList = old.map((a) =>
                    Number(a.id) === Number(normalized.id)
                        ? normalized
                        : a,
                );
                if (normalized.is_default) {
                    return updatedList.map((a) => ({
                        ...a,
                        is_default: Number(a.id) === Number(normalized.id),
                    }));
                }
                return updatedList;
            });

            queryClient.setQueryData(
                ['address', normalized.id],
                normalized,
            );

            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'updated',
                currentDeliveryAddress: current,
                updatedAddress: normalized,
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
            setDeliveryAddress(normalizeAddress(next));
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (address: Address) =>
            storeService.updateAddress(
                address.id,
                toUpdateRequestFromAddress(address),
            ),
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
            const normalized = normalizeAddress(updatedAddress) || updatedAddress;
            queryClient.setQueryData(['addresses'], (old: Address[] = []) =>
                old.map((a) =>
                    Number(a.id) === Number(normalized.id)
                        ? normalized
                        : {
                              ...a,
                              is_default:
                                  Number(a.id) === Number(normalized.id),
                          },
                ),
            );
            const current = useOrderStore.getState().deliveryAddress;
            const next = getNextDeliveryAddressAfterMutation({
                event: 'set_default',
                currentDeliveryAddress: current,
                updatedAddress: normalized,
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
