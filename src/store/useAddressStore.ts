// src/store/useAddressStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address } from '@/types/address';

/**
 * Store for managing guest addresses (local storage only).
 * Per requirements: Guests can only have ONE address.
 */
interface AddressState {
    guestAddress: Address | null;
    setGuestAddress: (address: Address | null) => void;
    clearGuestAddress: () => void;
}

const ADDRESS_STORAGE_VERSION = 2; // Incremented version due to structural change

export const useAddressStore = create<AddressState>()(
    persist(
        (set) => ({
            guestAddress: null,
            setGuestAddress: (address) => set({ guestAddress: address }),
            clearGuestAddress: () => set({ guestAddress: null }),
        }),
        {
            name: 'guest-address-storage',
            version: ADDRESS_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
            migrate: (persistedState: any, version: number) => {
                if (version < 2) {
                    // Handle migration from old array-based storage if needed
                    const oldState = persistedState as { addresses: Address[] };
                    return {
                        guestAddress: oldState.addresses?.[0] || null,
                    };
                }
                return persistedState as AddressState;
            },
        },
    ),
);
