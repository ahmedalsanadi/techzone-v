'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { usePaymentStatus } from '@/hooks/checkout';
import { parsePaymentResult } from '@/lib/checkout';

const RESULT_LAYOUT_CLASS =
    'container mx-auto min-h-screen py-24 flex flex-col items-center justify-center gap-6 px-4';

export default function CheckoutResultPage() {
    const t = useTranslations('Checkout');
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attempt_id');
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('order_id');

    const { data: paymentData, isLoading, isError } = usePaymentStatus(attemptId);

    const { orderId, isSuccess, isFailed, message } = parsePaymentResult({
        attemptId,
        statusParam,
        orderIdParam,
        paymentData,
        isLoading,
        isError,
        t,
    });

    if (!isSuccess && !isFailed) {
        return (
            <div className={`${RESULT_LAYOUT_CLASS} gap-4`}>
                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                <p className="text-gray-600 font-medium">
                    {t('loading') || 'Checking payment status...'}
                </p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className={RESULT_LAYOUT_CLASS}>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center">
                    {t('orderCreatedSuccessfully')}
                </h1>
                {orderId != null && (
                    <Button asChild variant="primary" size="xl">
                        <Link href={`/my-orders/${orderId}`}>{t('viewOrder') || 'View order'}</Link>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={RESULT_LAYOUT_CLASS}>
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
                <Button asChild variant="primary" size="xl">
                    <Link href="/checkout">{t('backToCheckout') || 'Back to checkout'}</Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="border-2">
                    <Link href="/cart">{t('backToCart') || 'Back to cart'}</Link>
                </Button>
            </div>
        </div>
    );
}
