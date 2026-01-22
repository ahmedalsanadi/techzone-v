import CheckoutCard from './CheckoutCard';

export default function CouponCard() {
    return (
        <CheckoutCard title="الكوبونات والعروض">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="كود الكوبون"
                    className="w-full sm:w-60  border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-600"
                />
                <button className="px-6 py-2.5 border border-red-600 text-red-600 rounded-lg text-lg font-semibold hover:bg-red-50 whitespace-nowrap">
                    تحقق
                </button>
            </div>
        </CheckoutCard>
    );
}
