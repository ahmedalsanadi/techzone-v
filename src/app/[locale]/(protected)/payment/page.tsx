import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getTranslations } from "next-intl/server";


export default async function PaymentPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
   
    const t = await getTranslations({ locale, namespace: 'Payment' });
    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('payment'), href: '/payment', active: true },
    ];
    return (
        <main className="min-h-screen bg-gray-50/30 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
        </main>
    );
}