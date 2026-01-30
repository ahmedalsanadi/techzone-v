/**
 * React Query hooks for managing customer addresses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import {
    Address,
    CreateAddressRequest,
    UpdateAddressRequest,
} from '@/types/address';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { toast } from 'sonner';

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
 * Hook for address mutations (create, update, delete)
 */
export function useAddressMutations() {
    const queryClient = useQueryClient();
    const { setDeliveryAddress } = useOrderStore();

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateAddressRequest) =>
            storeService.createAddress(data),
        onSuccess: (newAddress) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            // Sync with order store for display purposes (subheader)
            if (newAddress.is_default) {
                setDeliveryAddress(newAddress);
            }
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateAddressRequest;
        }) => storeService.updateAddress(id, data),
        onSuccess: (updatedAddress) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            queryClient.invalidateQueries({
                queryKey: ['address', updatedAddress.id],
            });
            // Always sync the updated address if it's the one currently selected or if it's default
            setDeliveryAddress(updatedAddress);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => storeService.deleteAddress(id),
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });

            // If the deleted address was the one being displayed in SubHeader, clear it
            const currentSelected = useOrderStore.getState().deliveryAddress;
            if (currentSelected && Number(currentSelected.id) === deletedId) {
                setDeliveryAddress(null);
            }
        },
    });

    return {
        createAddress: createMutation,
        updateAddress: updateMutation,
        deleteAddress: deleteMutation,
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
