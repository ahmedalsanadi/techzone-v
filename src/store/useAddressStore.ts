// src/store/useAddressStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address } from '@/types/address';

interface AddressState {
    addresses: Address[];
    addAddress: (address: Address) => void;
    updateAddress: (address: Address) => void;
    deleteAddress: (id: number) => void;
    setDefaultAddress: (id: number) => void;
    clearAddresses: () => void;
}

const ADDRESS_STORAGE_VERSION = 1;

export const useAddressStore = create<AddressState>()(
    persist(
        (set) => ({
            addresses: [],
            addAddress: (address) =>
                set((state) => {
                    let newAddresses = [...state.addresses, address];
                    // If it's the first address, make it default
                    if (newAddresses.length === 1) {
                        newAddresses[0] = {
                            ...newAddresses[0],
                            is_default: true,
                        };
                    } else if (address.is_default) {
                        // If new address is marked default, unset others
                        newAddresses = newAddresses.map((a) => ({
                            ...a,
                            is_default: a.id === address.id,
                        }));
                    }
                    return { addresses: newAddresses };
                }),
            updateAddress: (updatedAddress) =>
                set((state) => {
                    let newAddresses = state.addresses.map((addr) =>
                        addr.id === updatedAddress.id ? updatedAddress : addr,
                    );
                    if (updatedAddress.is_default) {
                        newAddresses = newAddresses.map((a) => ({
                            ...a,
                            is_default: a.id === updatedAddress.id,
                        }));
                    }
                    return { addresses: newAddresses };
                }),
            deleteAddress: (id) =>
                set((state) => {
                    const newAddresses = state.addresses.filter(
                        (addr) => addr.id !== id,
                    );
                    // If we deleted the default address, make another one default
                    if (
                        newAddresses.length > 0 &&
                        !newAddresses.some((a) => a.is_default)
                    ) {
                        newAddresses[0] = {
                            ...newAddresses[0],
                            is_default: true,
                        };
                    }
                    return { addresses: newAddresses };
                }),
            setDefaultAddress: (id) =>
                set((state) => ({
                    addresses: state.addresses.map((addr) => ({
                        ...addr,
                        is_default: addr.id === id,
                    })),
                })),
            clearAddresses: () => set({ addresses: [] }),
        }),
        {
            name: 'addresses-storage',
            version: ADDRESS_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
