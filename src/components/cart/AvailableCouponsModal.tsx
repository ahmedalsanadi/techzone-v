'use client';

import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Ticket, Loader2 } from 'lucide-react';
import { useAvailableCoupons } from '@/hooks/cart/useCoupons';
import { useLocale, useTranslations } from 'next-intl';

interface AvailableCouponsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (code: string) => void;
}

export default function AvailableCouponsModal({ isOpen, onClose, onApply }: AvailableCouponsModalProps) {
    const locale = useLocale();
    const t = useTranslations('Cart');
    const isRtl = locale === 'ar';
    const { data, isLoading, isError } = useAvailableCoupons(isOpen);

    const coupons = data?.data || [];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={onClose}
                dir={isRtl ? 'rtl' : 'ltr'}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto w-full z-50">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveTo="opacity-0 scale-95 translate-y-4">
                            <div className="w-full h-full max-w-md flex items-center justify-center">
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                    <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Ticket className="w-5 h-5 text-theme-primary" />
                                        <span>{t('couponsAvailable')}</span>
                                    </DialogTitle>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
                                        </div>
                                    ) : isError ? (
                                        <div className="text-center py-8 text-gray-500">
                                            {t('failedToLoadCoupons')}
                                        </div>
                                    ) : coupons.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            {t('noCouponsAvailable')}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {coupons.map((coupon) => (
                                                <div key={coupon.id} className="bg-white border text-start border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-theme-primary/30 transition-colors">
                                                    <div className="absolute top-0 right-0 w-1.5 h-full bg-theme-primary/20 group-hover:bg-theme-primary transition-colors"></div>
                                                    
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-900 text-lg mb-1">{coupon.title}</div>
                                                            {coupon.description && <div className="text-sm text-gray-500 mb-3 line-clamp-2">{coupon.description}</div>}
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-theme-primary/10 text-theme-primary px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider">
                                                                    {coupon.code}
                                                                </span>
                                                                <span className="text-xs text-gray-400">{coupon.type_label}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => onApply(coupon.code)}
                                                            className="bg-theme-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-theme-primary-hover transition-colors shrink-0 whitespace-nowrap">
                                                            {t('couponApply')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogPanel>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
