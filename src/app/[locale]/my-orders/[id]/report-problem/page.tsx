// src/app/[locale]/my-orders/[id]/report-problem/page.tsx
import { notFound } from 'next/navigation';
import { orderService } from '@/services/order-service';
import ReportProblemView from '../../utils/components/ReportProblemView';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'ReportProblem' });

    return {
        title: t('title'),
    };
}

export default async function ReportProblemPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { id } = await params;

    // Fetch the order data from the real API
    try {
        const order = await orderService.getOrder(id);

        if (!order) {
            notFound();
        }

        return <ReportProblemView order={order} />;
    } catch (error) {
        console.error('Failed to fetch order for problem report:', error);
        notFound();
    }
}
