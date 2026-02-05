'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import OrderTypeCard from './components/OrderTypeCard';
import WalletDiscountCard from './components/WalletDiscountCard';
import PaymentMethodCard from './components/PaymentMethodCard';
import CouponCard from './components/CouponCard';
import OrderSummaryCard from './components/OrderSummaryCard';
import { orderService } from '@/services/order-service';
import { walletService } from '@/services/wallet-service';
import { cartService } from '@/services/cart-service';
import {
    PaymentMethod,
    FulfillmentMethod,
    PaymentMethodType,
} from '@/types/orders';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore, getScheduledTimeAsDate } from '@/store/useOrderStore';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useLocale } from 'next-intl';

export default function CheckoutPage() {
    const t = useTranslations('Checkout');
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
    } = useOrderStore();

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedPaymentMethodType, setSelectedPaymentMethodType] =
        useState<PaymentMethodType | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [useWallet, setUseWallet] = useState<boolean>(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Fees
    const [shippingFee, setShippingFee] = useState(0);
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [methods, balance] = await Promise.all([
                    orderService.getPaymentMethods(),
                    walletService.getBalance(),
                ]);
                setPaymentMethods(methods);
                // Default to first available method that is not wallet
                const defaultMethod = methods.find((m) => m.type !== 'wallet');
                if (defaultMethod) {
                    setSelectedPaymentMethodType(defaultMethod.type);
                }
                setWalletBalance(balance.balance);
            } catch (error) {
                console.error('Failed to fetch checkout data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleCheckout = async () => {
        if (orderType === 'delivery' && !deliveryAddress) {
            toast.error(t('pleaseSelectAddress'));
            return;
        }

        const cartSubtotal = getTotalPrice();
        const totalToPay = cartSubtotal + shippingFee - discount;
        const willUseWallet = useWallet && walletBalance > 0;

        // 1. Payment Validation
        const isFullyWalletCovered = useWallet && walletBalance >= totalToPay;
        if (!isFullyWalletCovered && !selectedPaymentMethodType) {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }

        setIsSubmitting(true);
        try {
            // 2. Validate Cart
            const validation = await cartService.validateCart();
            if (!validation.valid) {
                toast.error(
                    validation.issues?.[0]?.message || t('checkoutFailed'),
                );
                return;
            }

            // 3. Map orderType to FulfillmentMethod
            const fulfillment_method =
                orderType === 'delivery'
                    ? FulfillmentMethod.DELIVERY
                    : orderType === 'pickup'
                      ? FulfillmentMethod.PICKUP
                      : orderType === 'carPickup'
                        ? FulfillmentMethod.CURBSIDE
                        : FulfillmentMethod.DINE_IN;

            const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);

            // Mapping: epayment -> card, cod -> cod, wallet -> wallet
            let payment_method: PaymentMethodType | 'card' = 'cod';
            const isFullyWallet = useWallet && walletBalance >= totalToPay;

            if (isFullyWallet) {
                payment_method = 'wallet';
            } else if (selectedPaymentMethodType === 'epayment') {
                payment_method = 'card';
            } else if (selectedPaymentMethodType === 'cod') {
                payment_method = 'cod';
            }

            const payload = {
                fulfillment_method,
                address_id: deliveryAddress?.id
                    ? Number(deliveryAddress.id)
                    : undefined,
                payment_method: payment_method as any,
                use_wallet: useWallet,
                customer_pickup_datetime:
                    orderTime === 'later' ? scheduledTime?.toISOString() : null,
                notes: '',
            };

            const response = await orderService.createOrder(payload);
            toast.success(t('orderCreatedSuccessfully'));
            clearCart();
            router.push(`/my-orders/${response.id}`);
        } catch (error: any) {
            toast.error(error.message || t('checkoutFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const locale = useLocale();

    const cartSubtotal = getTotalPrice();
    const finalTotal = Math.max(
        0,
        cartSubtotal + shippingFee - discount - (useWallet ? walletBalance : 0),
    );

    if (isLoadingData) {
        return (
            <div className="container mx-auto min-h-screen py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                <p className="text-gray-500 font-medium">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto min-h-screen py-6 md:py-12 px-4 sm:px-6 space-y-6 md:space-y-8">
            {/* Breadcrumb */}
            <div className="hidden sm:block">
                <Breadcrumbs
                    items={[
                        { label: t('breadcrumbHome'), href: '/' },
                        { label: t('breadcrumbCart'), href: '/cart' },
                        { label: t('breadcrumbCheckout'), href: '/checkout' },
                    ]}
                />
            </div>

            {/* Page Title */}
            <h1 className="text-xl sm:text-3xl font-bold">{t('title')}</h1>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {/* Right Section */}
                <div className="flex-1 space-y-4">
                    <OrderTypeCard />

                    <WalletDiscountCard
                        balance={formatCurrency(walletBalance, locale)}
                        selected={useWallet ? 'yes' : 'no'}
                        onChange={(val: 'yes' | 'no') =>
                            setUseWallet(val === 'yes')
                        }
                    />

                    <PaymentMethodCard
                        methods={paymentMethods}
                        selectedType={selectedPaymentMethodType}
                        onChange={(type) => setSelectedPaymentMethodType(type)}
                    />

                    <CouponCard />
                </div>

                {/* Left Section */}
                <div className="lg:w-96">
                    <OrderSummaryCard
                        items={[
                            {
                                label: t('orderSubtotal'),
                                value: formatCurrency(cartSubtotal, locale),
                            },
                            {
                                label: t('deliveryFee'),
                                value: formatCurrency(shippingFee, locale),
                            },
                            {
                                label: t('discount'),
                                value: formatCurrency(discount, locale),
                            },
                            ...(useWallet && walletBalance > 0
                                ? [
                                      {
                                          label: t('walletDeduction'),
                                          value: `- ${formatCurrency(
                                              Math.min(
                                                  cartSubtotal +
                                                      shippingFee -
                                                      discount,
                                                  walletBalance,
                                              ),
                                              locale,
                                          )}`,
                                          isNegative: true,
                                      },
                                  ]
                                : []),
                        ]}
                        total={formatCurrency(finalTotal, locale)}
                        onSubmit={handleCheckout}
                        isLoading={isSubmitting}
                        disabled={items.length === 0}
                    />
                </div>
            </div>
        </div>
    );
}
