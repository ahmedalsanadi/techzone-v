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
    /** Pickup/curbside datetime; stored as Date or ISO string after rehydration. Sent as customer_pickup_datetime to API. */
    customerPickupDatetime: Date | string | null;
    orderTime: OrderTime;
    notes: string | null;
    setOrderType: (type: OrderType) => void;
    setDeliveryAddress: (address: DeliveryAddress | null) => void;
    setCustomerPickupDatetime: (time: Date | null) => void;
    setOrderTime: (time: OrderTime) => void;
    setNotes: (notes: string | null) => void;
    setOrderState: (
        state: Partial<
            Pick<
                OrderState,
                | 'orderType'
                | 'deliveryAddress'
                | 'customerPickupDatetime'
                | 'orderTime'
                | 'notes'
            >
        >,
    ) => void;
    clearOrder: () => void;
}

interface PersistedState {
    orderType: OrderType | null;
    deliveryAddress: DeliveryAddress | null;
    customerPickupDatetime: string | null; // ISO string for Date
    orderTime: OrderTime;
    notes: string | null;
    version: number;
}

const ORDER_STORAGE_VERSION = 2;

export const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            orderType: 'delivery',
            deliveryAddress: null,
            customerPickupDatetime: null,
            orderTime: 'now',
            notes: null,
            setOrderType: (type: OrderType) => set({ orderType: type }),
            setDeliveryAddress: (address: DeliveryAddress | null) =>
                set({
                    deliveryAddress: address ? normalizeAddress(address) : null,
                }),
            setCustomerPickupDatetime: (time: Date | null) =>
                set({ customerPickupDatetime: time }),
            setOrderTime: (time: OrderTime) => set({ orderTime: time }),
            setNotes: (notes: string | null) => set({ notes }),
            setOrderState: (
                state: Partial<
                    Pick<
                        OrderState,
                        | 'orderType'
                        | 'deliveryAddress'
                        | 'customerPickupDatetime'
                        | 'orderTime'
                        | 'notes'
                    >
                >,
            ) => set((prev) => ({ ...prev, ...state })),
            clearOrder: () =>
                set({
                    orderType: null,
                    deliveryAddress: null,
                    customerPickupDatetime: null,
                    orderTime: 'now',
                    notes: null,
                }),
        }),
        {
            name: 'order-storage',
            version: ORDER_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
            partialize: (state): PersistedState => ({
                orderType: state.orderType,
                deliveryAddress: state.deliveryAddress,
                customerPickupDatetime:
                    state.customerPickupDatetime instanceof Date
                        ? state.customerPickupDatetime.toISOString()
                        : state.customerPickupDatetime || null,
                orderTime: state.orderTime,
                notes: state.notes ?? null,
                version: ORDER_STORAGE_VERSION,
            }),
            migrate: (
                persistedState: unknown,
                version: number,
            ): PersistedState => {
                const state = persistedState as Partial<PersistedState> & {
                    scheduledTime?: string | null;
                };
                // v1 had scheduledTime; v2 uses customerPickupDatetime + notes
                const customerPickupDatetime =
                    state?.customerPickupDatetime ??
                    state?.scheduledTime ??
                    null;
                const orderType = state?.orderType ?? null;
                const deliveryAddress = normalizeAddress(
                    state?.deliveryAddress || null,
                );
                const orderTime = state?.orderTime ?? 'now';
                const notes = state?.notes ?? null;
                return {
                    orderType,
                    deliveryAddress,
                    customerPickupDatetime,
                    orderTime,
                    notes,
                    version: ORDER_STORAGE_VERSION,
                };
            },
        },
    ),
);

/** Convert persisted customerPickupDatetime string back to Date (after rehydration). */
export const getCustomerPickupDatetimeAsDate = (
    customerPickupDatetime: Date | string | null,
): Date | null => {
    if (!customerPickupDatetime) return null;
    if (customerPickupDatetime instanceof Date) return customerPickupDatetime;
    if (typeof customerPickupDatetime === 'string') {
        const date = new Date(customerPickupDatetime);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
};
