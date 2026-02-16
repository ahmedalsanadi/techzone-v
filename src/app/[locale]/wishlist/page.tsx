'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useWishlistActions } from '@/hooks/wishlist';
import { Link } from '@/i18n/navigation';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import CurrencySymbol from '@/components/ui/CurrencySymbol';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductConfigFlow } from '@/hooks/products';

const WishlistPage = () => {
    const t = useTranslations('Wishlist');
    const { items, getTotalItems, syncWithAPI, isLoading, isGuestMode } =
        useWishlistStore();
    const { isAuthenticated } = useAuthStore();
    const { toggleWishlist, removeFromWishlist } = useWishlistActions();
    const { loadingProductId, handleAddClick } = useProductConfigFlow();

    // const router = useRouter();
    const isMounted = useSyncExternalStore(
        () => () => {
            /* no-op */
        },
        () => true,
        () => false,
    );

    // CRITICAL: Only sync wishlist with API when authenticated
    // Guest users should only see local wishlist (no API calls)
    useEffect(() => {
        if (!isMounted) return;

        // Only make API call if user is authenticated
        if (isAuthenticated && !isGuestMode) {
            syncWithAPI();
        }
        // If not authenticated, wishlist page will show local guest wishlist (or empty)
    }, [isMounted, isAuthenticated, isGuestMode, syncWithAPI]);

    const handleMoveToCart = async (item: (typeof items)[0]) => {
        // Construct a partial product for the config flow
        // The flow will fetch full details using the slug
        const partialProduct = {
            id: item.productId,
            slug: item.slug,
            title: item.name,
            cover_image_url: item.image,
            price: item.price,
            sale_price: item.salePrice || undefined,
        } as any;

        await handleAddClick(partialProduct);
    };

    if (!isMounted) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Heart size={48} className="text-gray-300" />
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

    return (
        <div className="space-y-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                {t('title')}
                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {t('items', { count: getTotalItems() })}
                </span>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {items.map((item) => {
                    const productUrl = `/products/${item.slug}`;
                    const finalPrice = item.salePrice || item.price;
                    const hasDiscount =
                        item.salePrice !== null && item.salePrice < item.price;
                    const isAdding = loadingProductId === item.productId;

                    return (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            {/* Product Image - Clickable */}
                            <Link
                                href={productUrl}
                                className="relative w-full aspect-square bg-gray-50 overflow-hidden group">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                />
                                {hasDiscount && (
                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                        {t('discount')}
                                    </div>
                                )}
                            </Link>

                            <div className="p-4 flex-1 flex flex-col">
                                {/* Product Info - Clickable */}
                                <Link
                                    href={productUrl}
                                    className="flex-1 hover:opacity-80 transition-opacity cursor-pointer mb-3">
                                    <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2 line-clamp-2">
                                        {item.name}
                                    </h3>

                                    <div className="flex items-center gap-2">
                                        {hasDiscount && (
                                            <span className="text-sm text-gray-400 line-through">
                                                {item.price}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-theme-primary font-black">
                                            <span>{finalPrice}</span>
                                            <CurrencySymbol className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </Link>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto">
                                    <Button
                                        variant="outlineTint"
                                        size="lg"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveToCart(item);
                                        }}
                                        disabled={isLoading || isAdding}
                                        className="flex-1">
                                        {isAdding ? (
                                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <ShoppingBag className="w-4 h-4" />
                                        )}
                                        <span className="text-sm">
                                            {t('addToCart')}
                                        </span>
                                    </Button>

                                    <Button
                                        variant="ghostDanger"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromWishlist(item.productId);
                                        }}
                                        disabled={isLoading || isAdding}
                                        className="shrink-0">
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WishlistPage;
