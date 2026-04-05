'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import CheckoutCard from '@/components/checkout/CheckoutCard';
import OrderTypeCard from '@/components/checkout/OrderTypeCard';
import PaymentMethodCard from '@/components/checkout/PaymentMethodCard';
import OrderSummaryCard from '@/components/checkout/OrderSummaryCard';
import { PaymentMethodType } from '@/types/orders';
import { useCartStore } from '@/store/useCartStore';
import {
    useOrderStore,
    getCustomerPickupDatetimeAsDate,
} from '@/store/useOrderStore';
import { formatCurrency } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';
import { useCheckoutInit, useCreateOrder } from '@/hooks/checkout';
import {
    orderTypeToFulfillment,
    formatDateTimeForApi,
    earliestPickupDate,
    buildCreateOrderPayload,
    buildSummaryItems,
    isEpaymentValid,
} from '@/lib/checkout';
import CheckoutPageSkeleton from '@/components/checkout/CheckoutPageSkeleton';
import ShippingSpeedCard from '@/components/checkout/ShippingSpeedCard';

const ORDER_TYPE_SCROLL_ID = 'checkout-order-type';

function getCheckoutBreadcrumbs(t: (key: string) => string) {
    return [
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbCart'), href: '/cart' },
        { label: t('breadcrumbCheckout'), href: '/checkout' },
    ];
}

export default function CheckoutPage() {
    const t = useTranslations('Checkout');
    const locale = useLocale();
    const router = useRouter();
    const { items, clearCart } = useCartStore();
    const {
        orderType,
        deliveryAddress,
        customerPickupDatetime: customerPickupDatetimeRaw,
        orderTime,
        notes: orderNotes,
        setNotes,
    } = useOrderStore();

    const [selectedPaymentMethodType, setSelectedPaymentMethodType] =
        useState<PaymentMethodType | null>(null);
    const [selectedEpaymentMethodId, setSelectedEpaymentMethodId] = useState<
        number | null
    >(null);
    const [useWallet, setUseWallet] = useState(true); // Wallet on by default; user can turn off
    const [openOrderTypeModal, setOpenOrderTypeModal] = useState(false);
    const [selectedShippingSpeedTypeId, setSelectedShippingSpeedTypeId] =
        useState<number | null>(null);

    const fulfillment_method = orderTypeToFulfillment(orderType);
    const address_id =
        orderType === 'delivery' && deliveryAddress?.id
            ? Number(deliveryAddress.id)
            : undefined;

    const canRunInit =
        orderType !== 'delivery' ||
        (deliveryAddress?.id != null && Number(deliveryAddress.id) > 0);

    const isPickupOrCurbside =
        orderType === 'pickup' || orderType === 'carPickup';
    const customerPickupDatetimeDate = getCustomerPickupDatetimeAsDate(
        customerPickupDatetimeRaw,
    );
    const initCustomerPickupDatetime: string | undefined = isPickupOrCurbside
        ? orderTime === 'later' && customerPickupDatetimeDate
            ? formatDateTimeForApi(customerPickupDatetimeDate)
            : formatDateTimeForApi(earliestPickupDate())
        : undefined;

    const cartHash = items.map((i) => `${i.id}-${i.quantity}`).join('|');
    const {
        initData,
        initError,
        isLoading: isLoadingData,
        isFetching: isFetchingData,
        refetch,
    } = useCheckoutInit({
        fulfillment_method,
        address_id,
        customer_pickup_datetime: isPickupOrCurbside
            ? initCustomerPickupDatetime
            : undefined,
        shipping_speed_type: selectedShippingSpeedTypeId ?? undefined,
        enabled: canRunInit,
        cartHash,
        epayment_method_id: selectedEpaymentMethodId,
        payment_method: selectedPaymentMethodType,
    });

    // Handle shipping speed validity
    useEffect(() => {
        let shouldReset = false;

        if (orderType !== 'delivery') {
            shouldReset = selectedShippingSpeedTypeId !== null;
        } else {
            const availableSpeeds = initData?.shipping_speed_types || [];
            const validIds = availableSpeeds.map((s) => s.value);

            if (availableSpeeds.length > 0) {
                shouldReset =
                    selectedShippingSpeedTypeId !== null &&
                    !validIds.includes(selectedShippingSpeedTypeId);
            } else {
                shouldReset = selectedShippingSpeedTypeId !== null;
            }
        }

        if (!shouldReset) return;
        const tid = window.setTimeout(() => {
            setSelectedShippingSpeedTypeId(null);
        }, 0);
        return () => clearTimeout(tid);
    }, [initData, selectedShippingSpeedTypeId, orderType]);

    const createOrderMutation = useCreateOrder();

    const paymentMethods = initData?.payment_methods ?? [];
    const walletBalance = initData?.wallet?.balance ?? 0;
    const walletAvailable =
        (initData?.wallet?.is_active && initData?.wallet?.balance > 0) ?? false;
    const summary = initData?.summary;
    const cart_valid = initData?.cart_valid ?? false;
    const cart_issues = initData?.cart_issues ?? [];
    const shippingSpeedTypes = initData?.shipping_speed_types ?? [];
    const totalFromSummary = summary?.total ?? 0;
    const isFullyWalletCovered = useWallet && walletBalance >= totalFromSummary;
    const discount = 0;

    // When wallet covers full total, clear card/gateway selection so UI is not confusing (deferred to avoid sync setState in effect)
    useEffect(() => {
        if (!isFullyWalletCovered) return;
        const tid = window.setTimeout(() => {
            setSelectedPaymentMethodType(null);
            setSelectedEpaymentMethodId(null);
        }, 0);
        return () => clearTimeout(tid);
    }, [isFullyWalletCovered]);

    const walletDeduction =
        useWallet && walletBalance > 0
            ? Math.min(totalFromSummary - discount, walletBalance)
            : 0;
    const finalTotal = Math.max(
        0,
        totalFromSummary - discount - walletDeduction,
    );

    const scrollToOrderTypeCard = useCallback(() => {
        setOpenOrderTypeModal(true);
        setTimeout(
            () =>
                document.getElementById(ORDER_TYPE_SCROLL_ID)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                }),
            100,
        );
    }, []);

    const handleCheckout = async () => {
        if (orderType === 'delivery' && !deliveryAddress) {
            toast.error(t('pleaseSelectAddress'));
            return;
        }
        if (!cart_valid) {
            const firstIssue = cart_issues[0];
            toast.error((firstIssue?.message as string) || t('checkoutFailed'));
            return;
        }
        if (!isFullyWalletCovered && !selectedPaymentMethodType) {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }
        if (
            selectedPaymentMethodType === 'epayment' &&
            !isEpaymentValid(paymentMethods, selectedEpaymentMethodId)
        ) {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }

        const customerPickupDatetimeDate = getCustomerPickupDatetimeAsDate(
            customerPickupDatetimeRaw,
        );
        const isPickupOrCurbside =
            orderType === 'pickup' || orderType === 'carPickup';
        const customer_pickup_datetime =
            orderTime === 'later' && customerPickupDatetimeDate
                ? formatDateTimeForApi(customerPickupDatetimeDate)
                : isPickupOrCurbside
                  ? formatDateTimeForApi(earliestPickupDate())
                  : undefined;

        let payment_method: 'cod' | 'wallet' | 'epayment' = 'cod';
        if (isFullyWalletCovered) payment_method = 'wallet';
        else if (selectedPaymentMethodType === 'cod') payment_method = 'cod';
        else if (
            selectedPaymentMethodType === 'epayment' &&
            selectedEpaymentMethodId
        ) {
            payment_method = 'epayment';
        } else {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }

        const payload = buildCreateOrderPayload({
            fulfillment_method,
            address_id:
                orderType === 'delivery' && deliveryAddress?.id
                    ? Number(deliveryAddress.id)
                    : undefined,
            customer_pickup_datetime: customer_pickup_datetime,
            notes: (orderNotes ?? '').trim() || undefined,
            payment_method,
            epayment_method_id: selectedEpaymentMethodId ?? undefined,
            use_wallet: useWallet && walletBalance > 0 && !isFullyWalletCovered,
            locale,
            shipping_speed_type: selectedShippingSpeedTypeId ?? undefined,
        });

        try {
            const response = await createOrderMutation.mutateAsync(payload);

            // Only redirect to gateway when we actually chose epayment; never for wallet or COD
            if (payment_method === 'epayment' && response.redirect_url) {
                window.location.href = response.redirect_url;
                return;
            }
            toast.success(t('orderCreatedSuccessfully'));
            clearCart();
            if (response.id != null) router.push(`/my-orders/${response.id}`);
        } catch (err: unknown) {
            console.error('Checkout Error:', err);
            toast.error(getApiErrorMessage(err, t('checkoutFailed')));
        }
    };

    const summaryItems = buildSummaryItems({
        summary,
        discount,
        walletDeduction,
        useWallet,
        formatCurrency,
        t,
        locale,
    });

    const breadcrumbs = getCheckoutBreadcrumbs(t);
    const needsAddressOrType = !canRunInit && !initData;
    const isInitError = initError != null && !initData;

    const selectedSpeed = shippingSpeedTypes.find(
        (s) => s.value === selectedShippingSpeedTypeId,
    );

    const orderTypeCard = (
        <OrderTypeCard
            isOpen={openOrderTypeModal}
            onOpenChange={setOpenOrderTypeModal}
            shippingSpeedLabel={selectedSpeed?.label}
        />
    );

    if (isLoadingData && !initData && !needsAddressOrType) {
        return <CheckoutPageSkeleton />;
    }

    if (isInitError) {
        return (
            <div className="space-y-6 py-2">
                <h1 className="text-xl sm:text-3xl font-bold mb-6">
                    {t('title')}
                </h1>
                <div id={ORDER_TYPE_SCROLL_ID} className="scroll-mt-4">
                    {orderTypeCard}
                </div>
                <div className="max-w-lg mt-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                    <p className="text-amber-900 font-medium mb-4">
                        {initError}
                    </p>
                    <p className="text-amber-800 text-sm mb-6">
                        {t('chooseAddressOrTypeHint')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            variant="primary"
                            size="xl"
                            onClick={scrollToOrderTypeCard}>
                            {t('chooseAddressOrType')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="xl"
                            onClick={() => refetch()}
                            className="border-2">
                            {t('retry')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (needsAddressOrType) {
        return (
            <div className="space-y-6 py-2">
                <div className="hidden sm:block">
                    <Breadcrumbs items={breadcrumbs} />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold">{t('title')}</h1>
                <div id={ORDER_TYPE_SCROLL_ID} className="scroll-mt-4">
                    {orderTypeCard}
                </div>
                <div className="max-w-lg p-6 bg-theme-primary/5 border-2 border-theme-primary/20 rounded-2xl">
                    <p className="text-gray-800 font-bold mb-2">
                        {t('selectAddressToContinue')}
                    </p>
                    <p className="text-gray-600 text-sm mb-6">
                        {t('selectAddressToContinueHint')}
                    </p>
                    <Button
                        type="button"
                        variant="primary"
                        size="xl"
                        onClick={scrollToOrderTypeCard}>
                        {t('chooseAddressOrType')}
                    </Button>
                </div>
            </div>
        );
    }

    const submitDisabled =
        items.length === 0 ||
        !cart_valid ||
        (!isFullyWalletCovered && !selectedPaymentMethodType) ||
        (selectedPaymentMethodType === 'epayment' && !selectedEpaymentMethodId);
    const disabledReason =
        items.length === 0
            ? undefined
            : !cart_valid
              ? t('cartInvalid')
              : !isFullyWalletCovered && !selectedPaymentMethodType
                ? t('pleaseSelectPaymentMethod')
                : selectedPaymentMethodType === 'epayment' &&
                    !selectedEpaymentMethodId
                  ? t('selectEpaymentMethod')
                  : undefined;

    return (
        <div className="space-y-6 py-2">
            <div className="hidden sm:block">
                <Breadcrumbs items={breadcrumbs} />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold">{t('title')}</h1>

            {!cart_valid && cart_issues.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                    <p className="font-bold mb-1">
                        {t('cartInvalid') || 'Cart has issues'}
                    </p>
                    <ul className="text-sm list-disc list-inside">
                        {cart_issues.map((issue, i) => (
                            <li key={i}>
                                {(issue as { message?: string }).message ||
                                    'Invalid item'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                <div className="flex-1 space-y-4">
                    <div id={ORDER_TYPE_SCROLL_ID} className="scroll-mt-4">
                        {orderTypeCard}
                    </div>

                    <PaymentMethodCard
                        methods={paymentMethods}
                        summaryTotal={totalFromSummary}
                        selectedType={selectedPaymentMethodType}
                        selectedEpaymentMethodId={selectedEpaymentMethodId}
                        useWallet={useWallet}
                        walletCoversTotal={isFullyWalletCovered}
                        walletAvailable={walletAvailable}
                        walletBalance={walletBalance}
                        onUseWalletChange={setUseWallet}
                        onChange={(type) => {
                            setSelectedPaymentMethodType(type);
                            // Do not auto-select a gateway; user must click one after selecting epayment
                            if (type !== 'epayment')
                                setSelectedEpaymentMethodId(null);
                        }}
                        onEpaymentMethodChange={setSelectedEpaymentMethodId}
                    />

                    {orderType === 'delivery' &&
                        shippingSpeedTypes.length > 0 && (
                            <ShippingSpeedCard
                                title={t('shippingSpeed')}
                                options={shippingSpeedTypes}
                                selectedId={selectedShippingSpeedTypeId}
                                onChange={(id) => {
                                    setSelectedShippingSpeedTypeId(id);
                                }}
                                isLoading={isLoadingData}
                            />
                        )}

                    <CheckoutCard title={t('notes')}>
                        <div className="space-y-2">
                            <textarea
                                id="checkout-notes"
                                value={orderNotes ?? ''}
                                onChange={(e) =>
                                    setNotes(
                                        e.target.value.length > 0
                                            ? e.target.value
                                            : null,
                                    )
                                }
                                placeholder={t('notesPlaceholder')}
                                maxLength={500}
                                rows={3}
                                className="w-full resize-y min-h-[80px] rounded-lg border border-gray-200 bg-gray-50/80 p-3.5 text-sm text-gray-800 placeholder:text-gray-500 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 transition-colors"
                            />
                            <div className="flex justify-end">
                                <span className="text-xs text-gray-500 tabular-nums">
                                    {orderNotes?.length ?? 0}/500
                                </span>
                            </div>
                        </div>
                    </CheckoutCard>
                </div>

                <div className="lg:w-96">
                    <OrderSummaryCard
                        items={summaryItems}
                        total={finalTotal}
                        onSubmit={handleCheckout}
                        isLoading={createOrderMutation.isPending}
                        isRefreshing={isFetchingData}
                        disabled={submitDisabled || isFetchingData}
                        disabledReason={disabledReason}
                    />
                </div>
            </div>
        </div>
    );
}
