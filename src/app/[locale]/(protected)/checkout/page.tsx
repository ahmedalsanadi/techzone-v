// src/app/[locale]/(protected)/checkout/page.tsx

import Breadcrumbs from '@/components/ui/Breadcrumbs';
import OrderTypeCard from './components/OrderTypeCard';
import WalletDiscountCard from './components/WalletDiscountCard';
import PaymentMethodCard from './components/PaymentMethodCard';
import CouponCard from './components/CouponCard';
import OrderSummaryCard from './components/OrderSummaryCard';

export default function CheckoutPage() {
    //fetch data can be here for server later
    const paymentMethods = [
        { id: 1, name: 'STC', isSelected: true },
        { id: 2, name: 'PayPal', isSelected: false },
        { id: 3, name: 'Visa', isSelected: false },
    ];

    return (
        <div className="container mx-auto min-h-screen py-6 md:py-12 px-4 sm:px-6 space-y-6 md:space-y-8">
            {/* Breadcrumb */}
            <div className="hidden sm:block">
                <Breadcrumbs
                    items={[
                        { label: 'الرئيسية', href: '/' },
                        { label: 'السلة', href: '/cart' },
                        { label: 'الدفع', href: '/checkout' },
                    ]}
                />
            </div>

            {/* Page Title */}
            <h1 className="text-xl sm:text-3xl font-bold">الدفع</h1>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {/* Right Section */}
                <div className="flex-1 space-y-4">
                    <OrderTypeCard
                        addressLabel="توصيل إلى"
                        deliveryType="المنزل"
                        address="حي اليرموك، شارع النجاح، منزل رقم 42، الرياض 13243"
                        date="25/11/2025"
                        time="4:30 م"
                    />

                    <WalletDiscountCard balance="20 ﷼" selected="yes" />

                    <PaymentMethodCard methods={paymentMethods} />

                    <CouponCard />
                </div>

                {/* Left Section */}
                <div className="lg:w-96">
                    <OrderSummaryCard
                        items={[
                            { label: 'قيمة الطلب', value: '﷼ 35.00' },
                            { label: 'التوصيل', value: '﷼ 5.00' },
                            { label: 'الخصم', value: '﷼ 12.00' },
                        ]}
                        total="﷼ 35"
                    />
                </div>
            </div>
        </div>
    );
}
