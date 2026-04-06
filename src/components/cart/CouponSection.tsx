'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Loader2, Ticket, X } from 'lucide-react';
import { useApplyCoupon, useRemoveCoupon } from '@/hooks/cart/useCoupons';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api';
import AvailableCouponsModal from './AvailableCouponsModal';

interface CouponSectionProps {
    onSuccess?: () => void;
}

export default function CouponSection({ onSuccess }: CouponSectionProps) {
    const t = useTranslations('Cart');
    const { appliedCoupons, isGuestMode } = useCartStore();
    const [code, setCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const applyMutation = useApplyCoupon();
    const removeMutation = useRemoveCoupon();

    const handleApply = async (couponCode: string) => {
        if (!couponCode.trim()) return;
        try {
            const res = await applyMutation.mutateAsync(couponCode);
            setCode('');
            toast.success(res.message || t('couponApplySuccess'));
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('couponApplyFailed')));
        }
    };

    const handleRemove = async (couponCode: string) => {
        try {
            const res = await removeMutation.mutateAsync(couponCode);
            toast.success(res.message || t('couponRemoveSuccess'));
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('couponRemoveFailed')));
        }
    };

    // If guest mode, hide since coupons are typically authenticated cart operations
    // Or at least depend on an active cart. Guests do not have an API cart unless syncing is adjusted.
    if (isGuestMode) return null;

    return (
        <div className="border-t border-gray-100 pt-4 mt-4 w-full">
            <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-gray-800 font-bold">
                    {t('couponTitle')}
                </span>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-theme-primary font-medium hover:underline flex items-center gap-1"
                >
                    <Ticket className="w-4 h-4" />
                    <span>{t('couponsAvailable')}</span>
                </button>
            </div>
            
            {appliedCoupons && appliedCoupons.length > 0 ? (
                <div className="space-y-2 mb-3">
                    {appliedCoupons.map((coupon) => (
                        <div key={coupon.code} className="flex items-center justify-between bg-green-50/50 border border-green-100 p-2.5 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 text-green-600 p-1.5 rounded-md">
                                    <Ticket className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-green-800">{coupon.code}</span>
                                    {coupon.title && <span className="text-xs text-green-600">{coupon.title}</span>}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(coupon.code)}
                                disabled={removeMutation.isPending}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                            >
                                {removeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={t('couponPlaceholder')}
                        className="w-full sm:flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApply(code);
                            }
                        }}
                    />
                    <Button
                        type="button"
                        size="lg"
                        disabled={applyMutation.isPending}
                        onClick={() => handleApply(code)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 whitespace-nowrap">
                        {applyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t('couponApply')}
                    </Button>
                </div>
            )}

            <AvailableCouponsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApply={(c) => {
                    handleApply(c);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
