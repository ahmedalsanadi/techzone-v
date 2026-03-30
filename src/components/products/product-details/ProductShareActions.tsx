'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/store';
import { useWishlistActions } from '@/hooks/wishlist';
import { useWishlistStore } from '@/store/useWishlistStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
}

const ActionButton = React.memo(
    ({ icon: Icon, label, onClick, isActive }: ActionButtonProps) => (
        <Button
            type="button"
            variant="secondaryTint"
            size="lg"
            onClick={onClick}
            className={cn(
                'shadow-sm group',
                isActive && 'bg-theme-primary/10',
            )}>
            <Icon
                className={cn(
                    'w-4 h-4 sm:w-[18px] sm:h-[18px] transition-colors',
                    isActive
                        ? 'text-theme-primary fill-theme-primary'
                        : 'text-gray-400 group-hover:text-theme-primary',
                )}
            />
            <span
                className={cn(
                    'text-xs sm:text-sm font-bold',
                    isActive ? 'text-theme-primary' : 'text-gray-700',
                )}>
                {label}
            </span>
        </Button>
    ),
);

ActionButton.displayName = 'ActionButton';

interface ProductShareActionsProps {
    product: Product;
}

export default function ProductShareActions({
    product,
}: ProductShareActionsProps) {
    const t = useTranslations('Product');
    const { toggleWishlist } = useWishlistActions();
    const wishlistItems = useWishlistStore((state) => state.items);

    const isInWishlist = React.useMemo(
        () => wishlistItems.some((item) => item.productId === product.id),
        [wishlistItems, product.id],
    );

    const handleToggleWishlist = React.useCallback(() => {
        toggleWishlist(product.id, {
            productId: product.id,
            name: product.title,
            image: product.cover_image_url,
            price: product.price,
            salePrice: product.sale_price || null,
            slug: product.slug,
            isVariation: product.is_variation,
        });
    }, [product, toggleWishlist]);

    const handleShare = React.useCallback(() => {
        if (typeof window === 'undefined') return;

        const url = window.location.href;
        if (navigator.share) {
            navigator
                .share({
                    title: product.title,
                    text: product.subtitle || product.title,
                    url: url,
                })
                .catch((err) => console.log('Error sharing:', err));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url);
            toast.success(t('linkCopied') || 'Link copied to clipboard');
        }
    }, [product, t]);

    const actions = React.useMemo(
        () => [
            {
                label: t('share'),
                icon: Share2,
                onClick: handleShare,
            },
            {
                label: t('favorite'),
                icon: Heart,
                isActive: isInWishlist,
                onClick: handleToggleWishlist,
            },
        ],
        [t, isInWishlist, handleToggleWishlist, handleShare],
    );

    return (
        <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
                {actions.map((action, index) => (
                    <ActionButton key={index} {...action} />
                ))}
            </div>
            {/* Placeholder for Breadcrumbs logic if needed later */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 font-medium">
                {/* In a real app, breadcrumbs would be here */}
            </div>
        </div>
    );
}
