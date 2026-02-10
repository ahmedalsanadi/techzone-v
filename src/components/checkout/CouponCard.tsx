import CheckoutCard from './CheckoutCard';

export default function CouponCard() {
    return (
        <CheckoutCard title="الكوبونات والعروض">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="كود الكوبون"
                    className="w-full sm:w-60 border border-gray-300 rounded-lg px-4 py-2.5 focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all"
                />
                <button className="px-6 py-2.5 border border-theme-primary text-theme-primary rounded-lg text-lg font-semibold hover:bg-theme-primary/10 transition-all whitespace-nowrap">
                    تحقق
                </button>
            </div>
        </CheckoutCard>
    );
}
