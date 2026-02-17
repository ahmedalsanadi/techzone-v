// src/store/useOrderStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type OrderType = 'delivery' | 'pickup' | 'dineIn' | 'carPickup';
export type OrderTime = 'now' | 'later';

import { Address, normalizeAddress } from '@/types/address';

export type DeliveryAddress = Address;

interface OrderState {
    orderType: OrderType | null;
    deliveryAddress: DeliveryAddress | null;
    scheduledTime: Date | string | null; // Can be Date or string (after rehydration)
    orderTime: OrderTime;
    setOrderType: (type: OrderType) => void;
    setDeliveryAddress: (address: DeliveryAddress | null) => void;
    setScheduledTime: (time: Date | null) => void;
    setOrderTime: (time: OrderTime) => void;
    setOrderState: (
        state: Partial<
            Pick<
                OrderState,
                'orderType' | 'deliveryAddress' | 'scheduledTime' | 'orderTime'
            >
        >,
    ) => void;
    clearOrder: () => void;
}

interface PersistedState {
    orderType: OrderType | null;
    deliveryAddress: DeliveryAddress | null;
    scheduledTime: string | null; // ISO string for Date
    orderTime: OrderTime;
    version: number;
}

const ORDER_STORAGE_VERSION = 1;

export const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            orderType: 'delivery',
            deliveryAddress: null,
            scheduledTime: null,
            orderTime: 'now',
            setOrderType: (type: OrderType) => set({ orderType: type }),
            setDeliveryAddress: (address: DeliveryAddress | null) =>
                set({
                    deliveryAddress: address ? normalizeAddress(address) : null,
                }),
            setScheduledTime: (time: Date | null) =>
                set({ scheduledTime: time }),
            setOrderTime: (time: OrderTime) => set({ orderTime: time }),
            setOrderState: (
                state: Partial<
                    Pick<
                        OrderState,
                        | 'orderType'
                        | 'deliveryAddress'
                        | 'scheduledTime'
                        | 'orderTime'
                    >
                >,
            ) => set((prev) => ({ ...prev, ...state })),
            clearOrder: () =>
                set({
                    orderType: null,
                    deliveryAddress: null,
                    scheduledTime: null,
                    orderTime: 'now',
                }),
        }),
        {
            name: 'order-storage',
            version: ORDER_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
            partialize: (state): PersistedState => ({
                orderType: state.orderType,
                deliveryAddress: state.deliveryAddress,
                scheduledTime:
                    state.scheduledTime instanceof Date
                        ? state.scheduledTime.toISOString()
                        : state.scheduledTime || null,
                orderTime: state.orderTime,
                version: ORDER_STORAGE_VERSION,
            }),
            migrate: (
                persistedState: unknown,
                version: number,
            ): PersistedState => {
                if (version !== ORDER_STORAGE_VERSION) {
                    return {
                        orderType: null,
                        deliveryAddress: null,
                        scheduledTime: null,
                        orderTime: 'now',
                        version: ORDER_STORAGE_VERSION,
                    };
                }
                const state = persistedState as Partial<PersistedState>;
                return {
                    orderType: state?.orderType ?? null,
                    deliveryAddress: normalizeAddress(
                        state?.deliveryAddress || null,
                    ),
                    scheduledTime: state?.scheduledTime ?? null,
                    orderTime: state?.orderTime ?? 'now',
                    version: ORDER_STORAGE_VERSION,
                };
            },
        },
    ),
);

// Helper to convert persisted scheduledTime string back to Date
// This is called after rehydration in components that use scheduledTime
export const getScheduledTimeAsDate = (
    scheduledTime: Date | string | null,
): Date | null => {
    if (!scheduledTime) return null;
    if (scheduledTime instanceof Date) return scheduledTime;
    if (typeof scheduledTime === 'string') {
        const date = new Date(scheduledTime);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
};
