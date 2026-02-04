// src/services/order-service.ts
import { fetchLibero, fetchLiberoFull } from './api';
import {
    Order,
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentMethod,
    PaymentGateway,
} from '@/types/orders';
import { PaginationMeta } from './types';

export const orderService = {
    /**
     * List customer orders.
     */
    getOrders: (params?: { page?: number; per_page?: number }) =>
        fetchLiberoFull<Order[]>('/store/orders', {
            params,
            isProtected: true,
        }),

    /**
     * Get order details.
     */
    getOrder: (id: number | string) =>
        fetchLibero<Order>(`/store/orders/${id}`, {
            isProtected: true,
        }),

    /**
     * Create a new order (checkout).
     */
    createOrder: (data: CreateOrderRequest) =>
        fetchLibero<CreateOrderResponse>('/store/orders', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
        }),

    /**
     * Cancel an order.
     */
    cancelOrder: (id: number | string) =>
        fetchLibero<{
            id: number;
            status: string;
            status_label: string;
            cancelled_at: string;
        }>(`/store/orders/${id}/cancel`, {
            method: 'POST',
            isProtected: true,
        }),

    /**
     * Get available payment methods.
     */
    getPaymentMethods: () =>
        fetchLibero<PaymentMethod[]>('/store/payment-methods'),

    /**
     * Get available payment gateways.
     */
    getPaymentGateways: () =>
        fetchLibero<PaymentGateway[]>('/store/payment-gateways'),
};
