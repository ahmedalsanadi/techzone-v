'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import OrderTypeCard from './components/OrderTypeCard';
import WalletDiscountCard from './components/WalletDiscountCard';
import PaymentMethodCard from './components/PaymentMethodCard';
import CouponCard from './components/CouponCard';
import OrderSummaryCard from './components/OrderSummaryCard';
import { orderService } from '@/services/order-service';
import {
    FulfillmentMethod,
    PaymentMethodType,
    CheckoutInitResponse,
} from '@/types/orders';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore, getScheduledTimeAsDate } from '@/store/useOrderStore';
import { useBranchStore } from '@/store/useBranchStore';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { ApiError } from '@/services/api';

function orderTypeToFulfillment(
    orderType: 'delivery' | 'pickup' | 'dineIn' | 'carPickup' | null,
): FulfillmentMethod {
    if (orderType === 'delivery') return FulfillmentMethod.DELIVERY;
    if (orderType === 'pickup') return FulfillmentMethod.PICKUP;
    if (orderType === 'carPickup') return FulfillmentMethod.CURBSIDE;
    if (orderType === 'dineIn') return FulfillmentMethod.DINE_IN;
    return FulfillmentMethod.DELIVERY;
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
    useBranchStore();

    const [initData, setInitData] = useState<CheckoutInitResponse | null>(null);
    const [initError, setInitError] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedPaymentMethodType, setSelectedPaymentMethodType] =
        useState<PaymentMethodType | null>(null);
    const [selectedEpaymentMethodId, setSelectedEpaymentMethodId] = useState<
        number | null
    >(null);
    const [useWallet, setUseWallet] = useState<boolean>(false);

    const fulfillment_method = orderTypeToFulfillment(orderType);
    const address_id =
        orderType === 'delivery' && deliveryAddress?.id
            ? Number(deliveryAddress.id)
            : undefined;

    const runInit = useCallback(async () => {
        setInitError(null);
        setIsLoadingData(true);
        try {
            const data = await orderService.checkoutInit({
                fulfillment_method,
                address_id,
            });
            setInitData(data);
            setSelectedPaymentMethodType((prev) => {
                if (prev) return prev;
                const first = data.payment_methods.find(
                    (m) => m.type !== 'wallet' && m.available,
                );
                return first?.type ?? null;
            });
            setSelectedEpaymentMethodId((prev) => {
                if (prev) return prev;
                const first = data.payment_methods
                    .find((m) => m.type === 'epayment')
                    ?.epayment_methods?.[0];
                return first?.id ?? null;
            });
        } catch (err) {
            console.error('Checkout init failed:', err);
            setInitData(null);
            setInitError(
                err instanceof ApiError ? err.message : t('checkoutFailed'),
            );
        } finally {
            setIsLoadingData(false);
        }
    }, [fulfillment_method, address_id, t]);

    useEffect(() => {
        runInit();
    }, [fulfillment_method, address_id, runInit]);

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

        setIsSubmitting(true);
        try {
            const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);
            const payload: Parameters<typeof orderService.createOrder>[0] = {
                fulfillment_method,
                address_id:
                    orderType === 'delivery' && deliveryAddress?.id
                        ? Number(deliveryAddress.id)
                        : undefined,
                customer_pickup_datetime:
                    orderTime === 'later' && scheduledTime
                        ? scheduledTime.toISOString().replace('T', ' ').slice(0, 19)
                        : undefined,
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
                setIsSubmitting(false);
                return;
            }

            if (useWallet && walletBalance > 0 && !isFullyWalletCovered) {
                payload.use_wallet = true;
            }

            const response = await orderService.createOrder(payload);

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
        } finally {
            setIsSubmitting(false);
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

    if (isLoadingData && !initData) {
        return (
            <div className="container mx-auto min-h-screen py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                <p className="text-gray-500 font-medium">{t('loading')}</p>
            </div>
        );
    }

    if (initError && !initData) {
        return (
            <div className="container mx-auto min-h-screen py-12 px-4">
                <div className="max-w-md mx-auto text-center">
                    <p className="text-red-600 font-medium mb-4">{initError}</p>
                    <button
                        type="button"
                        onClick={() => runInit()}
                        className="bg-theme-primary text-white font-bold py-2 px-6 rounded-xl">
                        {t('retry') || 'Retry'}
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
                    <OrderTypeCard />

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
                        isLoading={isSubmitting}
                        disabled={
                            items.length === 0 ||
                            !cart_valid ||
                            (!isFullyWalletCovered &&
                                !selectedPaymentMethodType) ||
                            (selectedPaymentMethodType === 'epayment' &&
                                !selectedEpaymentMethodId)
                        }
                    />
                </div>
            </div>
        </div>
    );
}
