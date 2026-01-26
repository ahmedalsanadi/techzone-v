// src/store/useAddressStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DeliveryAddress } from './useOrderStore';

interface AddressState {
    addresses: DeliveryAddress[];
    addAddress: (address: DeliveryAddress) => void;
    updateAddress: (address: DeliveryAddress) => void;
    deleteAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
}

const ADDRESS_STORAGE_VERSION = 1;

export const useAddressStore = create<AddressState>()(
    persist(
        (set) => ({
            addresses: [],
            addAddress: (address) =>
                set((state) => {
                    const newAddresses = [...state.addresses, address];
                    // If it's the first address, make it default
                    if (newAddresses.length === 1) {
                        newAddresses[0].isDefault = true;
                    } else if (address.isDefault) {
                        // If new address is marked default, unset others
                        newAddresses.forEach((a) => {
                            if (a.id !== address.id) a.isDefault = false;
                        });
                    }
                    return { addresses: newAddresses };
                }),
            updateAddress: (updatedAddress) =>
                set((state) => {
                    const newAddresses = state.addresses.map((addr) =>
                        addr.id === updatedAddress.id ? updatedAddress : addr,
                    );
                    if (updatedAddress.isDefault) {
                        newAddresses.forEach((a) => {
                            if (a.id !== updatedAddress.id) a.isDefault = false;
                        });
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
                        !newAddresses.some((a) => a.isDefault)
                    ) {
                        newAddresses[0].isDefault = true;
                    }
                    return { addresses: newAddresses };
                }),
            setDefaultAddress: (id) =>
                set((state) => ({
                    addresses: state.addresses.map((addr) => ({
                        ...addr,
                        isDefault: addr.id === id,
                    })),
                })),
        }),
        {
            name: 'addresses-storage',
            version: ADDRESS_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
