'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CartEmptyState() {
    const t = useTranslations('Cart');

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                {t('empty')}
            </h1>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                {t('emptyDesc')}
            </p>
            <Button
                asChild
                variant="primary"
                size="2xl"
                className="hover:-translate-y-1 active:scale-95">
                <Link href="/products">{t('backToMenu')}</Link>
            </Button>
        </div>
    );
}
