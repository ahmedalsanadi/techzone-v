'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { orderService } from '@/services/order-service';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const PAYMENT_STATUS_PAID = 4;

export default function CheckoutResultPage() {
    const t = useTranslations('Checkout');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(
        'loading',
    );
    const [orderId, setOrderId] = useState<number | null>(null);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const attemptId = searchParams.get('attempt_id');
        const statusParam = searchParams.get('status');
        const orderIdParam = searchParams.get('order_id');

        if (orderIdParam && statusParam === 'success') {
            const id = parseInt(orderIdParam, 10);
            if (!isNaN(id)) {
                setOrderId(id);
                setStatus('success');
                return;
            }
        }

        if (!attemptId) {
            setStatus('failed');
            setMessage(t('checkoutFailed'));
            return;
        }

        let cancelled = false;
        orderService
            .getPaymentStatus(attemptId)
            .then((data) => {
                if (cancelled) return;
                if (data.status === PAYMENT_STATUS_PAID && data.order_id) {
                    setOrderId(data.order_id);
                    setStatus('success');
                    if (data.order_id) {
                        router.replace(`/my-orders/${data.order_id}`);
                    }
                } else {
                    setStatus('failed');
                    setMessage(
                        data.status_label ||
                            (statusParam === 'error'
                                ? t('paymentFailed') || 'Payment failed'
                                : t('checkoutFailed')),
                    );
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStatus('failed');
                    setMessage(t('checkoutFailed'));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [searchParams, router, t]);

    if (status === 'loading') {
        return (
            <div className="container mx-auto min-h-screen py-24 flex flex-col items-center justify-center gap-4 px-4">
                <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
                <p className="text-gray-600 font-medium">
                    {t('loading') || 'Checking payment status...'}
                </p>
            </div>
        );
    }

    if (status === 'success') {
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
