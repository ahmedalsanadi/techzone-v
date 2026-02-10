//src/components/ui/ProductCard.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import DynamicImage from './DynamicImage';
import { Heart, Plus, ShoppingBasket, Loader2 } from 'lucide-react';
import CurrencySymbol from './CurrencySymbol';
import { Link } from '@/i18n/navigation';
import { useWishlistActions } from '@/hooks/wishlist';
import { useWishlistStore } from '@/store/useWishlistStore';

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
    onPrefetch?: () => void;
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
    onPrefetch,
}) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const hasPrefetchedRef = useRef(false);
    const { toggleWishlist } = useWishlistActions();
    useEffect(() => {
        if (!onPrefetch || !cardRef.current) return;
        if (hasPrefetchedRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    hasPrefetchedRef.current = true;
                    onPrefetch();
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' },
        );

        observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [onPrefetch]);
    // Subscribe to items array to make it reactive
    const wishlistItems = useWishlistStore((state) => state.items);
    const isInWishlistState = productId
        ? wishlistItems.some((item) => item.productId === productId)
        : false;

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
            const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
            const numericOldPrice = oldPrice 
                ? (typeof oldPrice === 'string' ? parseFloat(oldPrice) : oldPrice)
                : null;
            
            toggleWishlist(productId, {
                productId,
                name,
                image,
                price: numericPrice,
                salePrice: numericOldPrice,
                slug: productSlug || href.replace('/products/', ''),
            });
        }
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={onPrefetch}
            onFocus={onPrefetch}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden relative group shadow-sm flex flex-col h-full">
            {/* Wishlist Button */}
            <button
                onClick={handleWishlistClick}
                className={`absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center transition-all z-20 cursor-pointer ${
                    isInWishlistState
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-400 hover:text-red-500'
                }`}>
                <Heart className={`w-4 h-4 ${isInWishlistState ? 'fill-current' : ''}`} />
            </button>

            {/* Link wrapper for Image and Info */}
            <Link href={href} className="w-full flex flex-col flex-1">
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                    <DynamicImage
                        src={image}
                        alt={name}
                        fill
                        priority={priority}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                        fallbackComponent={
                            <div className="flex flex-col items-center justify-center gap-2 text-gray-300 h-full w-full">
                                <ShoppingBasket size={32} strokeWidth={1} />
                            </div>
                        }
                    />
                </div>

                {/* Product Info */}
                <div className="p-4 text-start flex flex-col flex-1">
                    <h3 className="text-md font-medium text-gray-900 line-clamp-2 leading-tight mb-3 min-h-10">
                        {name}
                    </h3>

                    {/* Price Section */}
                    <div className="flex items-center justify-start gap-2 mb-3">
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-gray-900">
                                {price}
                            </span>
                            <CurrencySymbol className="w-3 h-3" />
                        </div>
                        {oldPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {oldPrice}
                            </span>
                        )}
                    </div>

                    {/* Discount Badge */}
                    {discountBadge && (
                        <div className="mb-3">
                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                                {discountBadge}
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Add to Cart Button */}
            <div className="p-4 pt-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!isAdding) {
                            onAddToCartClick?.(e);
                        }
                    }}
                    disabled={isAdding}
                    className={`w-full font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 border cursor-pointer group/btn ${
                        isAdding
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-theme-primary/10 hover:bg-theme-primary hover:text-white text-theme-primary border-theme-primary'
                    }`}>
                    {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                    )}
                    <span className="text-sm">
                        {addToCartLabel || 'إضافة إلى السلة'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
