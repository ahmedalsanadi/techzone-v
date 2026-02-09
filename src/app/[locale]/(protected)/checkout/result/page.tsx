'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { usePaymentStatus } from '@/hooks/useCheckout';

const PAYMENT_STATUS_PAID = 4;

export default function CheckoutResultPage() {
    const t = useTranslations('Checkout');
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attempt_id');
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('order_id');

    const { data: paymentData, isLoading, isError } = usePaymentStatus(
        attemptId,
    );

    /** Success when: URL has order_id + success, or payment-status API says paid. */
    const orderIdFromUrlParsed =
        orderIdParam && statusParam === 'success'
            ? parseInt(orderIdParam, 10)
            : NaN;
    const orderIdFromUrl =
        Number.isInteger(orderIdFromUrlParsed) ? orderIdFromUrlParsed : null;
    const orderId =
        orderIdFromUrl ??
        (paymentData?.status === PAYMENT_STATUS_PAID && paymentData?.order_id
            ? paymentData.order_id
            : null);
    const isSuccess =
        orderIdFromUrl != null ||
        (paymentData?.status === PAYMENT_STATUS_PAID && !!paymentData?.order_id);

    /** No attempt_id and no success params → show failed. */
    const noAttemptAndNoSuccess =
        !attemptId && !(orderIdParam && statusParam === 'success');
    const isFailed =
        noAttemptAndNoSuccess ||
        (attemptId && !isLoading && (isError || !paymentData || paymentData.status !== PAYMENT_STATUS_PAID));

    const message =
        isFailed && paymentData && paymentData.status !== PAYMENT_STATUS_PAID
            ? paymentData.status_label
            : isFailed && statusParam === 'error'
              ? t('paymentFailed') || 'Payment failed'
              : isFailed
                ? t('checkoutFailed')
                : '';

    if (!isSuccess && !isFailed) {
        return (
            <div className="container mx-auto min-h-screen py-24 flex flex-col items-center justify-center gap-4 px-4">
                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                <p className="text-gray-600 font-medium">
                    {t('loading') || 'Checking payment status...'}
                </p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="container mx-auto min-h-screen py-24 flex flex-col items-center justify-center gap-6 px-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center">
                    {t('orderCreatedSuccessfully')}
                </h1>
                {orderId != null && (
                    <Link
                        href={`/my-orders/${orderId}`}
                        className="bg-theme-primary text-white font-bold py-3 px-8 rounded-xl hover:brightness-95">
                        {t('viewOrder') || 'View order'}
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto min-h-screen py-24 flex flex-col items-center justify-center gap-6 px-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center">
                {t('paymentFailed') || 'Payment failed'}
            </h1>
            {message && (
                <p className="text-gray-600 text-center max-w-md">{message}</p>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
                <Link
                    href="/checkout"
                    className="bg-theme-primary text-white font-bold py-3 px-8 rounded-xl hover:brightness-95">
                    {t('backToCheckout') || 'Back to checkout'}
                </Link>
                <Link
                    href="/cart"
                    className="border-2 border-gray-300 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-50">
                    {t('backToCart') || 'Back to cart'}
                </Link>
            </div>
        </div>
    );
}
