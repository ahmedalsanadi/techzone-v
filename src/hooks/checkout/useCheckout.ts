/**
 * TanStack Query hooks for checkout: init (useQuery), create order (useMutation), payment status (useQuery).
 */

import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import { orderService } from '@/services/order-service';
import { useBranchStore } from '@/store/useBranchStore';
import type {
    FulfillmentMethod,
    CheckoutInitResponse,
    CreateOrderRequest,
    PaymentStatusResponse,
    PaymentMethodSlug,
} from '@/types/orders';
import { getApiErrorMessage } from '@/lib/api';

export const checkoutInitKey = ['checkout', 'init'] as const;
export const paymentStatusKey = ['payment-status'] as const;

function buildInitQueryKey(
    fulfillment_method: FulfillmentMethod,
    address_id: number | undefined,
    shipping_speed_type: number | undefined,
    branch_id: number | null,
    cartHash: string,
    epayment_method_id: number | undefined,
    payment_method: PaymentMethodSlug | undefined,
): readonly [
    string,
    string,
    FulfillmentMethod,
    number | undefined,
    number | undefined,
    number | null,
    string,
    number | undefined,
    PaymentMethodSlug | undefined,
] {
    return [
        ...checkoutInitKey,
        fulfillment_method,
        address_id,
        shipping_speed_type,
        branch_id,
        cartHash,
        epayment_method_id,
        payment_method,
    ];
}

export interface UseCheckoutInitOptions {
    fulfillment_method: FulfillmentMethod;
    address_id: number | undefined;
    shipping_speed_type?: number;
    enabled: boolean;
    cartHash: string;
    epayment_method_id?: number | null;
    payment_method?: PaymentMethodSlug | null;
}

export function useCheckoutInit({
    fulfillment_method,
    address_id,
    shipping_speed_type,
    enabled,
    cartHash,
    epayment_method_id,
    payment_method,
}: UseCheckoutInitOptions) {
    const { selectedBranchId } = useBranchStore();
    const queryKey = buildInitQueryKey(
        fulfillment_method,
        address_id,
        shipping_speed_type,
        selectedBranchId,
        cartHash,
        epayment_method_id ?? undefined,
        payment_method ?? undefined,
    );

    const query = useQuery({
        queryKey,
        queryFn: async (): Promise<CheckoutInitResponse> => {
            const body: {
                fulfillment_method: FulfillmentMethod;
                address_id?: number;
                shipping_speed_type?: number;
                epayment_method_id?: number;
                payment_method?: PaymentMethodSlug;
            } = {
                fulfillment_method,
            };
            if (address_id != null) body.address_id = address_id;
            if (shipping_speed_type != null)
                body.shipping_speed_type = shipping_speed_type;
            if (epayment_method_id != null)
                body.epayment_method_id = epayment_method_id;
            if (payment_method != null) body.payment_method = payment_method;
            return orderService.checkoutInit(body);
        },
        enabled,
        staleTime: 0, // Always refetch when returning to checkout so summary reflects current cart
        refetchOnMount: 'always', // Refetch every time checkout page is opened
        placeholderData: keepPreviousData,
        retry: 1,
    });

    return {
        ...query,
        initData: query.data ?? null,
        initError: query.error
            ? getApiErrorMessage(query.error, 'Checkout failed')
            : null,
    };
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateOrderRequest) =>
            orderService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutInitKey });
        },
    });
}

export function usePaymentStatus(attemptId: string | null) {
    return useQuery({
        queryKey: [...paymentStatusKey, attemptId],
        queryFn: (): Promise<PaymentStatusResponse> =>
            orderService.getPaymentStatus(attemptId!),
        enabled: attemptId != null && attemptId !== '',
        staleTime: 1000 * 60,
        retry: 1,
    });
}
