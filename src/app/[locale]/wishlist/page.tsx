'use client';

import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useWishlistActions } from '@/hooks/wishlist';
import { Link } from '@/i18n/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductConfigFlow } from '@/hooks/products';
import ProductCard from '@/components/ui/ProductCard';

const WishlistPage = () => {
    const t = useTranslations('Wishlist');
    const { items, syncWithAPI, purgeDeletedItems, isLoading, isGuestMode } =
        useWishlistStore();
    const { isAuthenticated } = useAuthStore();
    const { toggleWishlist, removeFromWishlist } = useWishlistActions();
    const { loadingProductId, handleAddClick } = useProductConfigFlow();

    const validItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    Boolean(item.name?.trim()) &&
                    Boolean(item.slug?.trim()) &&
                    item.productId != null,
            ),
        [items],
    );

    // const router = useRouter();
    const isMounted = useSyncExternalStore(
        () => () => {
            /* no-op */
        },
        () => true,
        () => false,
    );

    // Authenticated: sync wishlist via protected wishlist API
    // Guest: validate product existence via public product API, purge deleted ones
    useEffect(() => {
        if (!isMounted) return;

        if (isAuthenticated && !isGuestMode) {
            syncWithAPI();
        } else {
            purgeDeletedItems();
        }
    }, [isMounted, isAuthenticated, isGuestMode, syncWithAPI, purgeDeletedItems]);

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

    if (validItems.length === 0) {
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
        <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                {t('title')}
                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {t('items', { count: validItems.length })}
                </span>
            </h1>

            <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {validItems.map((item, index) => {
                    const finalPrice = item.salePrice || item.price;
                    const oldPrice =
                        item.salePrice && item.salePrice < item.price
                            ? item.price
                            : undefined;
                    const discountPercent = oldPrice
                        ? Math.round(
                              ((item.price - item.salePrice!) / item.price) *
                                  100,
                          )
                        : undefined;

                    return (
                        <ProductCard
                            key={item.id}
                            index={index}
                            name={item.name}
                            image={item.image}
                            price={finalPrice}
                            oldPrice={oldPrice}
                            discountBadge={
                                discountPercent
                                    ? t('save', {
                                          amount: `${discountPercent}%`,
                                      })
                                    : undefined
                            }
                            href={`/products/${item.slug}`}
                            productId={item.productId}
                            productSlug={item.slug}
                            media={item.media}
                            showDelete={true}
                            onWishlistClick={() =>
                                removeFromWishlist(item.productId)
                            }
                            onAddToCartClick={() => handleMoveToCart(item)}
                            isAdding={loadingProductId === item.productId}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default WishlistPage;
