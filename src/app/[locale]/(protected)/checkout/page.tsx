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
import { PaymentMethod, FulfillmentMethod } from '@/types/orders';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore, getScheduledTimeAsDate } from '@/store/useOrderStore';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';

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
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        string | null
    >(null);
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
                if (methods.length > 0) {
                    setSelectedPaymentMethod(methods[0].slug);
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
        if (!selectedPaymentMethod) {
            toast.error(t('pleaseSelectPaymentMethod'));
            return;
        }

        if (orderType === 'delivery' && !deliveryAddress) {
            toast.error(t('pleaseSelectAddress'));
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Validate Cart
            const validation = await cartService.validateCart();
            if (!validation.is_valid) {
                toast.error(
                    validation.issues?.[0]?.message || t('checkoutFailed'),
                );
                return;
            }

            // 2. Map orderType to FulfillmentMethod
            const fulfillment_method =
                orderType === 'delivery'
                    ? FulfillmentMethod.DELIVERY
                    : orderType === 'pickup'
                      ? FulfillmentMethod.PICKUP
                      : orderType === 'carPickup'
                        ? FulfillmentMethod.CURBSIDE
                        : FulfillmentMethod.DINE_IN;

            const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);

            const payload = {
                fulfillment_method,
                address_id: deliveryAddress?.id
                    ? Number(deliveryAddress.id)
                    : undefined,
                payment_method:
                    useWallet && walletBalance > 0
                        ? 'wallet'
                        : (selectedPaymentMethod as any),
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

    const cartSubtotal = getTotalPrice();
    const finalTotal = cartSubtotal + shippingFee - discount;

    if (isLoadingData) {
        return (
            <div className="container mx-auto min-h-screen py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                <p className="text-gray-500 font-medium">
                    {t('loading') || 'جاري تحميل البيانات...'}
                </p>
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
                        balance={`${walletBalance} ﷼`}
                        selected={useWallet ? 'yes' : 'no'}
                        onChange={(val: 'yes' | 'no') =>
                            setUseWallet(val === 'yes')
                        }
                    />

                    <PaymentMethodCard
                        methods={paymentMethods.map((m) => ({
                            id: m.id,
                            name: m.name,
                            slug: m.slug,
                            isSelected: selectedPaymentMethod === m.slug,
                        }))}
                        onChange={(slug: string) =>
                            setSelectedPaymentMethod(slug)
                        }
                    />

                    <CouponCard />
                </div>

                {/* Left Section */}
                <div className="lg:w-96">
                    <OrderSummaryCard
                        items={[
                            {
                                label: t('orderSubtotal'),
                                value: `﷼ ${cartSubtotal.toFixed(2)}`,
                            },
                            {
                                label: t('deliveryFee'),
                                value: `﷼ ${shippingFee.toFixed(2)}`,
                            },
                            {
                                label: t('discount'),
                                value: `﷼ ${discount.toFixed(2)}`,
                            },
                        ]}
                        total={`﷼ ${finalTotal.toFixed(2)}`}
                        onSubmit={handleCheckout}
                        isLoading={isSubmitting}
                        disabled={items.length === 0}
                    />
                </div>
            </div>
        </div>
    );
}
