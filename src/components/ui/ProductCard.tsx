//src/components/ui/ProductCard.tsx
'use client';

import React from 'react';
import DynamicImage from './DynamicImage';
import {
    Heart,
    Plus,
    Minus,
    ShoppingBasket,
    Loader2,
    Trash2,
} from 'lucide-react';
import CurrencySymbol from './CurrencySymbol';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useCartActions, useCartProductSummary } from '@/hooks/cart';
import { useWishlistActions } from '@/hooks/wishlist';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { ProductMedia, ProductBrand } from '@/types/store';

interface ProductCardProps {
    name: string;
    image: string;
    price: number | string;
    oldPrice?: number | string;
    discountBadge?: string;
    addToCartLabel?: string;
    href?: string;
    priority?: boolean;
    productId?: number; // Product ID for wishlist functionality
    productSlug?: string; // Product slug for wishlist functionality
    onWishlistClick?: (e: React.MouseEvent) => void; // Optional custom handler
    onAddToCartClick?: (e: React.MouseEvent) => void;
    onClick?: () => void;
    isAdding?: boolean;
    index?: number;
    media?: ProductMedia;
    showDelete?: boolean;
    /** Optional brand; only shown when present */
    brand?: ProductBrand | null;
    /** From product list/detail; drives wishlist → cart detail fetch when true/unknown. */
    isVariation?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
    name,
    image,
    price,
    oldPrice,
    discountBadge,
    addToCartLabel,
    href = '#',
    priority = false,
    productId,
    productSlug,
    onWishlistClick,
    onAddToCartClick,
    onClick,
    isAdding = false,
    index = 0,
    media,
    showDelete = false,
    brand,
    isVariation,
}) => {
    const { toggleWishlist } = useWishlistActions();
    const cartSummary = useCartProductSummary(productId);
    const { updateItemQuantity, removeFromCart } = useCartActions();

    const isInWishlistState = useWishlistStore((state) =>
        productId
            ? state.items.some((item) => item.productId === productId)
            : false,
    );

    // Entrance stagger delay
    const animationDelay = `${(index % 8) * 50}ms`;

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Use custom handler if provided
        if (onWishlistClick) {
            onWishlistClick(e);
            return;
        }

        // Otherwise use default wishlist handler
        if (productId) {
            const numericPrice =
                typeof price === 'string' ? parseFloat(price) : price;
            const numericOldPrice = oldPrice
                ? typeof oldPrice === 'string'
                    ? parseFloat(oldPrice)
                    : oldPrice
                : null;

            toggleWishlist(productId, {
                productId,
                name,
                image,
                price: numericPrice,
                salePrice: numericOldPrice,
                slug: productSlug || href.replace('/products/', ''),
                ...(isVariation !== undefined && { isVariation }),
            });
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden relative group shadow-sm flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both w-full mx-auto transform-gpu transition-all hover:shadow-md"
            style={{ animationDelay }}>
            {/* Wishlist/Delete Button */}
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleWishlistClick}
                className={cn(
                    'absolute top-2 left-2 sm:top-3 sm:left-3 z-5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm',
                    showDelete
                        ? 'text-red-500 hover:bg-red-50'
                        : isInWishlistState
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-400 hover:text-red-500',
                )}>
                {showDelete ? (
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                    <Heart
                        className={cn(
                            'w-3.5 h-3.5 sm:w-4 sm:h-4',
                            isInWishlistState && 'fill-current',
                        )}
                    />
                )}
            </Button>

            {/* Link wrapper for Image and Info */}
            <Link href={href} className="w-full flex flex-col flex-1">
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden rounded-t-xl">
                    <DynamicImage
                        src={image}
                        mediaSizes={media?.cover?.sizes}
                        alt={name}
                        fill
                        priority={priority}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
                        index={index}
                        fallbackComponent={
                            <div className="flex flex-col items-center justify-center gap-2 text-gray-300 h-full w-full">
                                <ShoppingBasket size={32} strokeWidth={1} />
                            </div>
                        }
                    />
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-4 text-start flex flex-col flex-1">
                    {brand && (
                        <span className="inline-block text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">
                            {brand.name}
                        </span>
                    )}
                    <h3 className="text-sm sm:text-[16px] font-medium text-gray-900 line-clamp-2 leading-tight mb-2 sm:mb-3 h-8 sm:h-10">
                        {name}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                        {/* Price Section */}
                        <div className="flex items-center justify-start gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                                <span className="text-[15px] sm:text-[16px] font-bold text-gray-900">
                                    {price}
                                </span>
                                <CurrencySymbol className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </div>
                            {oldPrice && (
                                <span className="text-[12px] sm:text-[14px] text-gray-400 line-through">
                                    {oldPrice}
                                </span>
                            )}
                        </div>

                        {/* Discount Badge */}
                        {discountBadge && (
                            <div className="flex">
                                <span className="text-[11px] sm:text-[13px] font-medium text-red-500 bg-red-50/80 px-1.5 py-0.5 rounded-md border border-red-100">
                                    {discountBadge}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Add to Cart / QTY Controls */}
            <div className="p-2 sm:p-4 pt-0">
                {cartSummary ? (
                    <div className="w-full flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="stepper"
                            size="icon-xs"
                            aria-label="Decrease quantity"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (cartSummary.activeItemQty <= 1) {
                                    removeFromCart(cartSummary.activeItemId);
                                } else {
                                    updateItemQuantity(
                                        cartSummary.activeItemId,
                                        cartSummary.activeItemQty - 1,
                                    );
                                }
                            }}>
                            <Minus className="w-3.5 h-3.5" />
                        </Button>

                        <div
                            className="flex-1 h-7 sm:h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-sm sm:text-[15px] font-bold text-gray-900"
                            role="status"
                            aria-live="polite">
                            {cartSummary.totalQty}
                        </div>

                        <Button
                            type="button"
                            variant="stepper"
                            size="icon-xs"
                            aria-label="Increase quantity"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                updateItemQuantity(
                                    cartSummary.activeItemId,
                                    cartSummary.activeItemQty + 1,
                                );
                            }}>
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outlineTint"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isAdding) {
                                onAddToCartClick?.(e);
                            }
                        }}
                        disabled={isAdding}
                        className={cn(
                            'w-full rounded-lg active:scale-95 group/btn h-9 sm:h-11',
                            isAdding &&
                                'bg-gray-100 text-gray-400 border-gray-200',
                        )}>
                        {isAdding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Plus className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-90" />
                        )}
                        <span className="text-sm sm:text-[15px] font-medium">
                            {addToCartLabel || 'إضافة إلى السلة'}
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
