import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function CouponCard() {
    const t = useTranslations('Checkout');

    return (
        <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-gray-800 font-bold">
                    {t('couponTitle')}
                </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    type="text"
                    placeholder={t('couponPlaceholder')}
                    className="w-full sm:flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all"
                />
                <Button
                    type="button"
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto px-6 py-2.5 border-theme-primary text-theme-primary rounded-lg text-lg font-semibold hover:bg-theme-primary/10 whitespace-nowrap">
                    {t('couponApply')}
                </Button>
            </div>
        </div>
    );
}
