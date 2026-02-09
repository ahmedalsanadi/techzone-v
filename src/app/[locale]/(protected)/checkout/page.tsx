'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import OrderTypeCard from './components/OrderTypeCard';
import WalletDiscountCard from './components/WalletDiscountCard';
import PaymentMethodCard from './components/PaymentMethodCard';
import CouponCard from './components/CouponCard';
import OrderSummaryCard from './components/OrderSummaryCard';
import { orderService } from '@/services/order-service';
import { FulfillmentMethod, PaymentMethodType } from '@/types/orders';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore, getScheduledTimeAsDate } from '@/store/useOrderStore';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { ApiError } from '@/services/api';
import {
    useCheckoutInit,
    useCreateOrder,
    getDefaultPaymentSelection,
} from '@/hooks/useCheckout';

function orderTypeToFulfillment(
    orderType: 'delivery' | 'pickup' | 'dineIn' | 'carPickup' | null,
): FulfillmentMethod {
    if (orderType === 'delivery') return FulfillmentMethod.DELIVERY;
    if (orderType === 'pickup') return FulfillmentMethod.PICKUP;
    if (orderType === 'carPickup') return FulfillmentMethod.CURBSIDE;
    if (orderType === 'dineIn') return FulfillmentMethod.DINE_IN;
    return FulfillmentMethod.DELIVERY;
}

/** API expects "YYYY-MM-DD HH:mm:ss" for customer_pickup_datetime. */
function formatDateTimeForApi(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

/** For "now" pickup/curbside/dine-in: use now + 30 min as earliest pickup time. */
function earliestPickupDate(): Date {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d;
}

export default function CheckoutPage() {
    const t = useTranslations('Checkout');
    const router = useRouter();
    const locale = useLocale();
    const { items, clearCart } = useCartStore();
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
    } = useOrderStore();

    const [selectedPaymentMethodType, setSelectedPaymentMethodType] =
        useState<PaymentMethodType | null>(null);
    const [selectedEpaymentMethodId, setSelectedEpaymentMethodId] = useState<
        number | null
    >(null);
    const [useWallet, setUseWallet] = useState<boolean>(false);
    const [openOrderTypeModal, setOpenOrderTypeModal] = useState(false);

    const fulfillment_method = orderTypeToFulfillment(orderType);
    const address_id =
        orderType === 'delivery' && deliveryAddress?.id
            ? Number(deliveryAddress.id)
            : undefined;

    /** Backend requires address_id only for delivery (1). Branch is sent via x-branch-id header by proxy/cookies — not in init payload. */
    const canRunInit =
        orderType !== 'delivery' ||
        (deliveryAddress?.id != null && Number(deliveryAddress.id) > 0);

    const {
        initData,
        initError,
        isLoading: isLoadingData,
        refetch,
    } = useCheckoutInit({
        fulfillment_method,
        address_id,
        enabled: canRunInit,
    });

    const createOrderMutation = useCreateOrder();

    /** Seed default payment method when init data first loads (deferred to avoid sync setState in effect). */
    useEffect(() => {
        if (!initData) return;
        const { type, epaymentMethodId } = getDefaultPaymentSelection(initData);
        const tid = window.setTimeout(() => {
            setSelectedPaymentMethodType((prev) => prev ?? type);
            setSelectedEpaymentMethodId((prev) => prev ?? epaymentMethodId);
        }, 0);
        return () => clearTimeout(tid);
    }, [initData]);

    const paymentMethods = initData?.payment_methods ?? [];
    const walletBalance = initData?.wallet?.balance ?? 0;
    const walletAvailable =
        (initData?.wallet?.is_active && initData?.wallet?.balance > 0) ?? false;
    const summary = initData?.summary;
    const cart_valid = initData?.cart_valid ?? false;
    const cart_issues = initData?.cart_issues ?? [];
    const totalFromSummary = summary?.total ?? 0;
    const isFullyWalletCovered = useWallet && walletBalance >= totalFromSummary;
    const discount = 0;

    const walletDeduction =
        useWallet && walletBalance > 0
            ? Math.min(
                  totalFromSummary - discount,
                  walletBalance,
              )
            : 0;
    const finalTotal = Math.max(0, totalFromSummary - discount - walletDeduction);

    const handleCheckout = async () => {
        if (orderType === 'delivery' && !deliveryAddress) {
            toast.error(t('pleaseSelectAddress'));
            return;
        }

        if (!cart_valid) {
            const firstIssue = cart_issues[0];
            toast.error(
                (firstIssue?.message as string) || t('checkoutFailed'),
            );
            return;
        }

        if (!isFullyWalletCovered && !selectedPaymentMethodType) {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }

        if (
            selectedPaymentMethodType === 'epayment' &&
            (!selectedEpaymentMethodId ||
                !initData?.payment_methods
                    ?.find((m) => m.type === 'epayment')
                    ?.epayment_methods?.some(
                        (e) => e.id === selectedEpaymentMethodId,
                    ))
        ) {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }

        const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);
        const isPickupOrCurbside =
            orderType === 'pickup' || orderType === 'carPickup';
        const needsPickupDatetime = isPickupOrCurbside;
        const pickupDatetime =
            orderTime === 'later' && scheduledTime
                ? formatDateTimeForApi(scheduledTime)
                : needsPickupDatetime
                  ? formatDateTimeForApi(earliestPickupDate())
                  : undefined;

        const payload: Parameters<typeof orderService.createOrder>[0] = {
            fulfillment_method,
            address_id:
                orderType === 'delivery' && deliveryAddress?.id
                    ? Number(deliveryAddress.id)
                    : undefined,
            customer_pickup_datetime: pickupDatetime,
            notes: '',
            payment_method: 'cod',
        };

        if (isFullyWalletCovered) {
            payload.payment_method = 'wallet';
        } else if (selectedPaymentMethodType === 'cod') {
            payload.payment_method = 'cod';
        } else if (selectedPaymentMethodType === 'epayment' && selectedEpaymentMethodId) {
            payload.payment_method = 'epayment';
            payload.epayment_method_id = selectedEpaymentMethodId;
            const base = typeof window !== 'undefined' ? window.location.origin : '';
            payload.success_url = `${base}/${locale}/checkout/result?status=success`;
            payload.error_url = `${base}/${locale}/checkout/result?status=error`;
        } else {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }

        if (useWallet && walletBalance > 0 && !isFullyWalletCovered) {
            payload.use_wallet = true;
        }

        try {
            const response = await createOrderMutation.mutateAsync(payload);

            if (response.redirect_url) {
                window.location.href = response.redirect_url;
                return;
            }

            toast.success(t('orderCreatedSuccessfully'));
            clearCart();
            if (response.id != null) {
                router.push(`/my-orders/${response.id}`);
            }
        } catch (err: unknown) {
            console.error('Checkout Error:', err);
            const message =
                err instanceof ApiError
                    ? err.message
                    : (err && typeof err === 'object' && 'message' in err
                          ? String((err as { message: unknown }).message)
                          : t('checkoutFailed'));
            const data = err instanceof ApiError ? err.data : undefined;
            const firstValidation =
                data && typeof data === 'object' && !Array.isArray(data)
                    ? Object.values(data)[0]
                    : null;
            toast.error(
                (Array.isArray(firstValidation)
                    ? firstValidation[0]
                    : (firstValidation as string)) || message,
            );
        }
    };

    const summaryItems = [
        summary && {
            label: t('orderSubtotal'),
            value: formatCurrency(summary.items_subtotal, locale),
        },
        summary && {
            label: t('deliveryFee'),
            value: formatCurrency(summary.shipping_fee, locale),
        },
        summary?.cod_fee != null &&
            summary.cod_fee > 0 && {
                label: t('codFee') || 'COD Fee',
                value: formatCurrency(summary.cod_fee, locale),
            },
        summary?.tax_amount != null &&
            summary.tax_amount > 0 && {
                label: t('tax') || 'Tax',
                value: formatCurrency(summary.tax_amount, locale),
            },
        discount > 0 && {
            label: t('discount'),
            value: formatCurrency(discount, locale),
        },
        useWallet && walletDeduction > 0 && {
            label: t('walletDeduction'),
            value: `- ${formatCurrency(walletDeduction, locale)}`,
            isNegative: true,
        },
    ].filter(Boolean) as { label: string; value: string; isNegative?: boolean }[];

    const needsAddressOrType = !canRunInit && !initData;
    const isInitError = initError != null && !initData;

    if (isLoadingData && !initData && !needsAddressOrType) {
        return (
            <div className="container mx-auto min-h-screen py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                <p className="text-gray-500 font-medium">{t('loading')}</p>
            </div>
        );
    }

    if (isInitError) {
        return (
            <div className="container mx-auto min-h-screen py-6 md:py-12 px-4 sm:px-6">
                <h1 className="text-xl sm:text-3xl font-bold mb-6">{t('title')}</h1>
                <div id="checkout-order-type" className="scroll-mt-4">
                    <OrderTypeCard
                        openModal={openOrderTypeModal}
                        onModalOpened={() => setOpenOrderTypeModal(false)}
                    />
                </div>
                <div className="max-w-lg mt-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                    <p className="text-amber-900 font-medium mb-4">{initError}</p>
                    <p className="text-amber-800 text-sm mb-6">
                        {t('chooseAddressOrTypeHint')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setOpenOrderTypeModal(true);
                                setTimeout(
                                    () =>
                                        document
                                            .getElementById('checkout-order-type')
                                            ?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start',
                                            }),
                                    100,
                                );
                            }}
                            className="bg-theme-primary text-white font-bold py-2.5 px-6 rounded-xl hover:brightness-95">
                            {t('chooseAddressOrType')}
                        </button>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="border-2 border-gray-300 text-gray-700 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-50">
                            {t('retry')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (needsAddressOrType) {
        return (
            <div className="container mx-auto min-h-screen py-6 md:py-12 px-4 sm:px-6 space-y-6 md:space-y-8">
                <div className="hidden sm:block">
                    <Breadcrumbs
                        items={[
                            { label: t('breadcrumbHome'), href: '/' },
                            { label: t('breadcrumbCart'), href: '/cart' },
                            { label: t('breadcrumbCheckout'), href: '/checkout' },
                        ]}
                    />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold">{t('title')}</h1>

                <div id="checkout-order-type" className="scroll-mt-4">
                    <OrderTypeCard
                        openModal={openOrderTypeModal}
                        onModalOpened={() => setOpenOrderTypeModal(false)}
                    />
                </div>

                <div className="max-w-lg p-6 bg-theme-primary/5 border-2 border-theme-primary/20 rounded-2xl">
                    <p className="text-gray-800 font-bold mb-2">
                        {t('selectAddressToContinue')}
                    </p>
                    <p className="text-gray-600 text-sm mb-6">
                        {t('selectAddressToContinueHint')}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setOpenOrderTypeModal(true);
                            setTimeout(
                                () =>
                                    document
                                        .getElementById('checkout-order-type')
                                        ?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        }),
                                100,
                            );
                        }}
                        className="bg-theme-primary text-white font-bold py-3 px-8 rounded-xl hover:brightness-95">
                        {t('chooseAddressOrType')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto min-h-screen py-6 md:py-12 px-4 sm:px-6 space-y-6 md:space-y-8">
            <div className="hidden sm:block">
                <Breadcrumbs
                    items={[
                        { label: t('breadcrumbHome'), href: '/' },
                        { label: t('breadcrumbCart'), href: '/cart' },
                        { label: t('breadcrumbCheckout'), href: '/checkout' },
                    ]}
                />
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
                    <div id="checkout-order-type" className="scroll-mt-4">
                        <OrderTypeCard
                            openModal={openOrderTypeModal}
                            onModalOpened={() => setOpenOrderTypeModal(false)}
                        />
                    </div>

                    {walletAvailable && (
                        <WalletDiscountCard
                            balance={formatCurrency(walletBalance, locale)}
                            selected={useWallet ? 'yes' : 'no'}
                            onChange={(val: 'yes' | 'no') =>
                                setUseWallet(val === 'yes')
                            }
                        />
                    )}

                    <PaymentMethodCard
                        methods={paymentMethods}
                        summaryTotal={totalFromSummary}
                        selectedType={selectedPaymentMethodType}
                        selectedEpaymentMethodId={selectedEpaymentMethodId}
                        useWallet={useWallet}
                        walletCoversTotal={isFullyWalletCovered}
                        onChange={(type) => {
                            setSelectedPaymentMethodType(type);
                            if (type === 'epayment') {
                                const epay = paymentMethods.find(
                                    (m) => m.type === 'epayment',
                                );
                                const first = epay?.epayment_methods?.[0];
                                setSelectedEpaymentMethodId(first?.id ?? null);
                            } else {
                                setSelectedEpaymentMethodId(null);
                            }
                        }}
                        onEpaymentMethodChange={(id) =>
                            setSelectedEpaymentMethodId(id)
                        }
                    />

                    <CouponCard />
                </div>

                <div className="lg:w-96">
                    <OrderSummaryCard
                        items={summaryItems}
                        total={formatCurrency(finalTotal, locale)}
                        onSubmit={handleCheckout}
                        isLoading={createOrderMutation.isPending}
                        disabled={
                            items.length === 0 ||
                            !cart_valid ||
                            (!isFullyWalletCovered &&
                                !selectedPaymentMethodType) ||
                            (selectedPaymentMethodType === 'epayment' &&
                                !selectedEpaymentMethodId)
                        }
                        disabledReason={
                            items.length === 0
                                ? undefined
                                : !cart_valid
                                  ? t('cartInvalid')
                                  : !isFullyWalletCovered &&
                                      !selectedPaymentMethodType
                                    ? t('pleaseSelectPaymentMethod')
                                    : selectedPaymentMethodType === 'epayment' &&
                                          !selectedEpaymentMethodId
                                      ? t('selectEpaymentMethod')
                                      : undefined
                        }
                    />
                </div>
            </div>
        </div>
    );
}
