// src/app/[locale]/(protected)/checkout/page.tsx
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ChevronLeft, MapPin, Clock } from 'lucide-react';

export default function CheckoutPage() {
    const paymentmethods = [
        {
            id: 1,
            name: 'STC',
            isSelected: true,
        },
        {
            id: 2,
            name: 'PayPal',
            isSelected: false,
        },
        {
            id: 3,
            name: 'Visa',
            isSelected: false,
        },
    ];
    const isSelected = true;
    return (
        <div className="container mx-auto min-h-screen py-12 px-2 md:px-6 space-y-8">
            {/* Breadcrumb */}
            <Breadcrumbs
                items={[
                    { label: 'الرئيسية', href: '/' },
                    { label: 'السلة', href: '/cart' },
                    { label: 'الدفع', href: '/checkout' },
                ]}
            />

            {/* Page Title */}
            <h1 className="text-2xl sm:text-3xl font-bold">الدفع</h1>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Right Section - Main Content */}
                <div className="flex-1 space-y-4">
                    {/* Order Type and Time */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className=" flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                نوع الطلب ووقته
                            </h2>
                            <button className="bg-red-100 px-2 py-1 rounded-md flex items-center gap-1 text-red-600 text-md font-medium">
                                <span>تعديل</span>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-md space-y-3">
                            <div className="flex items-start gap-3 justify-start">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />

                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">
                                        توصيل إلى{' '}
                                    </span>
                                    <span className="text-red-600 font-medium">
                                        المنزل
                                    </span>
                                    <span className="text-gray-600 me-2">
                                        حي اليرموك، شارع النجاح، منزل رقم 42،
                                        الرياض 13243
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 justify-start">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div className="flex items-center gap-1">
                                    <span className="text-red-600 font-medium">
                                        لاحقاً
                                    </span>
                                    <span className="text-gray-600 me-2">
                                        25/11/2025
                                    </span>
                                    <span className="text-gray-400 me-1">
                                        ،
                                    </span>
                                    <span className="text-gray-600">
                                        4:30 م
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Discount */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-md font-bold text-right mb-4">
                                هل تريد خصم المبلغ من المحفظة؟
                            </h2>

                            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 mb-4">
                                <span className="text-gray-600 text-sm">
                                    رصيدك في المحفظة:
                                </span>
                                <span className="font-bold">20 ﷼</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center justify-start gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="radio"
                                        name="wallet"
                                        defaultChecked
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 rounded-full border-2 border-red-600 peer-checked:bg-red-600 peer-checked:border-red-600 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                </div>
                                <span className="text-gray-700">نعم</span>
                            </label>

                            <label className="flex items-center justify-start gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="radio"
                                        name="wallet"
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:bg-red-600 peer-checked:border-red-600 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
                                    </div>
                                </div>
                                <span className="text-gray-700">لا</span>
                            </label>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        {/*card header */}
                        <div className=" flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">طريقة الدفع</h2>
                            <button className="bg-red-100 px-2 py-1 rounded-md flex items-center gap-1 text-red-600 text-md font-medium">
                                <span>تغيير</span>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {paymentmethods.map((paymentmethod) => {
                                return (
                                    <div
                                        className={`w-20 h-14 flex items-center justify-center bg-white  ${paymentmethod.isSelected ? 'border-red-600 border-2' : 'border-gray-300 border'} rounded-lg cursor-pointer hover:scale-105 transition-all `}>
                                        <div className="text-center">
                                            <span className="text-purple-900 font-bold text-lg">
                                                {paymentmethod.name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Coupons and Offers */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-bold  mb-4">
                            الكوبونات والعروض
                        </h2>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="كود الكوبون"
                                className="w-60 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                            <button className="px-6 py-2.5 border border-red-600 text-red-600 rounded-lg text-lg font-semibold hover:bg-red-50 transition-colors cursor-pointer ">
                                تحقق
                            </button>

                        </div>
                    </div>
                </div>

                {/* Left Section - Order Summary */}
                <div className="lg:w-96">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
                        <h2 className="text-xl font-bold mb-6">
                            ملخص الطلب
                        </h2>

                        <div className="text-md font-medium space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">﷼ 35.00</span>
                                <span className="text-gray-700">
                                    قيمة الطلب
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">﷼ 5.00</span>
                                <span className="text-gray-700">التوصيل</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">﷼ 12.00</span>
                                <span className="text-gray-700">الخصم</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">﷼ 12.00</span>
                                <span className="text-gray-700">الاجمالي</span>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xl">
                                        ﷼ 35
                                    </span>
                                    <span className="font-bold text-lg">
                                        الاجمالي
                                    </span>
                                </div>
                            </div>

                            <button className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 rounded-lg transition-colors mt-4">
                                تقديم الطلب
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
