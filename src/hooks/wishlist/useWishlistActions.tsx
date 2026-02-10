// src/hooks/useWishlistActions.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useWishlistStore, WishlistItem } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { wishlistService } from '@/services/wishlist-service';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import React from 'react';
import { useRouter } from '@/i18n/navigation';

export const useWishlistActions = () => {
    const addItem = useWishlistStore((state) => state.addItem);
    const removeItem = useWishlistStore((state) => state.removeItem);
    const syncWithAPI = useWishlistStore((state) => state.syncWithAPI);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);
    const isGuestMode = useWishlistStore((state) => state.isGuestMode);
    const { isAuthenticated } = useAuthStore();
    const t = useTranslations('Wishlist');
    const router = useRouter();

    const toggleWishlist = async (productId: number, productData?: Omit<WishlistItem, 'id'>) => {
        const currentlyInWishlist = isInWishlist(productId);

        // CRITICAL: Only use API if authenticated
        // Guest users should only use local storage (no API calls)
        if (isAuthenticated && !isGuestMode) {
            try {
                // Use toggle endpoint for authenticated users
                const result = await wishlistService.toggleItem(productId);

                // Sync wishlist with API to get updated state
                await syncWithAPI();

                if (result.action === 'added') {
                    toast.success(t('added') || 'تمت الإضافة إلى قائمة الرغبات', {
                        icon: <Heart size={18} className="text-red-500 fill-red-500" />,
                    });
                } else {
                    toast.success(t('removed') || 'تم الحذف من قائمة الرغبات', {
                        icon: <Heart size={18} className="text-gray-400" />,
                    });
                }
            } catch (error) {
                console.error('Failed to toggle wishlist via API:', error);
                toast.error(t('toggleError') || 'فشل تحديث قائمة الرغبات');
            }
        } else {
            // Guest mode: use local store
            if (currentlyInWishlist) {
                removeItem(productId);
                toast.success(t('removed') || 'تم الحذف من قائمة الرغبات', {
                    icon: <Heart size={18} className="text-gray-400" />,
                });
            } else {
                if (!productData) {
                    console.error('Product data required for guest wishlist');
                    return;
                }
                addItem(productData);
                toast.success(t('added') || 'تمت الإضافة إلى قائمة الرغبات', {
                    icon: <Heart size={18} className="text-red-500 fill-red-500" />,
                });
            }
        }
    };

    const addToWishlist = async (productId: number, productData?: Omit<WishlistItem, 'id'>) => {
        // CRITICAL: Only use API if authenticated
        if (isAuthenticated && !isGuestMode) {
            try {
                await wishlistService.addItem({ product_id: productId });
                await syncWithAPI();
                toast.success(t('added') || 'تمت الإضافة إلى قائمة الرغبات', {
                    icon: <Heart size={18} className="text-red-500 fill-red-500" />,
                    description: t('viewWishlist'),
                    action: {
                        label: t('viewWishlist'),
                        onClick: () => router.push('/wishlist'),
                    },
                });
            } catch (error) {
                console.error('Failed to add item to wishlist via API:', error);
                toast.error(t('addError') || 'فشل إضافة المنتج إلى قائمة الرغبات');
            }
        } else {
            // Guest mode: use local store
            if (!productData) {
                console.error('Product data required for guest wishlist');
                return;
            }
            addItem(productData);
            toast.success(t('added') || 'تمت الإضافة إلى قائمة الرغبات', {
                icon: <Heart size={18} className="text-red-500 fill-red-500" />,
                description: t('viewWishlist'),
                action: {
                    label: t('viewWishlist'),
                    onClick: () => router.push('/wishlist'),
                },
            });
        }
    };

    const removeFromWishlist = async (productId: number) => {
        // CRITICAL: Only use API if authenticated
        if (isAuthenticated && !isGuestMode) {
            try {
                await wishlistService.removeItem(productId);
                await syncWithAPI();
                toast.success(t('removed') || 'تم الحذف من قائمة الرغبات');
            } catch (error) {
                console.error('Failed to remove item from wishlist via API:', error);
                toast.error(t('removeError') || 'فشل حذف المنتج من قائمة الرغبات');
            }
        } else {
            // Guest mode: use local store
            removeItem(productId);
        }
    };

    return {
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
    };
};
