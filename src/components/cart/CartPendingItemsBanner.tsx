'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import type { CartItem } from '@/store/useCartStore';

interface CartPendingItemsBannerProps {
    pendingItems: CartItem[];
    onClearPending: () => void;
}

export function CartPendingItemsBanner({
    pendingItems,
    onClearPending,
}: CartPendingItemsBannerProps) {
    const t = useTranslations('Cart');

    if (pendingItems.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-900">
            <h3 className="font-bold text-base mb-2">
                {t('needsConfigTitle') || 'Some items need configuration'}
            </h3>
            <p className="text-sm text-amber-800 mb-3">
                {t('needsConfigDesc') ||
                    'Review these items before they can be added to your cart.'}
            </p>
            <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs text-amber-700">
                    {pendingItems.length}{' '}
                    {t('items', { count: pendingItems.length })}
                </span>
                <Button
                    type="button"
                    variant="link"
                    onClick={onClearPending}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 p-0 h-auto min-h-0 underline">
                    {t('clearPending') || 'Clear pending items'}
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                {pendingItems.map((item) => {
                    const slug = item.metadata?.productSlug;
                    const url = slug ? `/products/${slug}` : '/products';
                    return (
                        <Link
                            key={item.id}
                            href={url}
                            className="flex items-center justify-between bg-white/60 border border-amber-100 rounded-xl px-3 py-2 text-sm font-medium hover:bg-white transition-colors">
                            <span className="truncate">{item.name}</span>
                            <span className="text-amber-700 font-bold">
                                {t('configure') || 'Configure'}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
