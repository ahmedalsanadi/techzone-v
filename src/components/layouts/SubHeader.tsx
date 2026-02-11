//src/components/layouts/SubHeader.tsx
'use client';

import { Building2, ChevronDown, MapPin, Clock, Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useBranchStore } from '@/store/useBranchStore';
import { useOrderStore, getScheduledTimeAsDate } from '@/store/useOrderStore';
import OrderTypeModal from '@/components/modals/OrderTypeModal';
import {
    getAddressLabel,
    formatAddressForDisplay,
    formatScheduledTime,
} from '@/lib/address';
import { Button } from '@/components/ui/Button';

export default function SubHeader() {
    const t = useTranslations('SubHeader');
    const { selectedBranchName, setModalOpen } = useBranchStore();
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
        setOrderType,
    } = useOrderStore();

    // Convert scheduledTime from string to Date if needed
    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Use persisted name - no fetch needed! Name is always available immediately
    const branchName = selectedBranchName || t('defaultBranch');

    const handleBranchClick = () => {
        setModalOpen(true);
    };

    const handleOrderTypeClick = (type: string) => {
        if (type === 'delivery') {
            setIsOrderModalOpen(true);
        } else {
            setOrderType(type as 'dineIn' | 'pickup' | 'carPickup');
        }
    };

    const activeOrderType = orderType || 'delivery';

    const orderTypes = [
        { id: 'dineIn', label: t('dineIn') },
        { id: 'pickup', label: t('pickup') },
        { id: 'delivery', label: t('delivery') },
    ];

    const activeStyle =
        'bg-theme-primary/5 text-theme-primary border-theme-primary-border';
    const inactiveStyle = 'bg-gray-50 text-gray-500 hover:border-gray-200';

    return (
        <>
            <div className="mt-5 lg:mt-2">
                {/* Desktop Layout: consistent vertical alignment and spacing */}
                <div className="hidden lg:flex bg-white rounded-t-xl min-h-18 h-16 items-center justify-between gap-6 px-5 shadow-t-sm border-t border-gray-200">
                    <div className="flex items-center gap-4 min-h-10">
                        <button
                            type="button"
                            onClick={handleBranchClick}
                            className="flex items-center gap-2 hover:bg-gray-50 p-2 -my-1 rounded-lg transition-colors duration-200 group cursor-pointer min-h-10"
                            aria-label={branchName}>
                            <div className="size-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0">
                                <Building2 className="size-4.5 text-gray-500" />
                            </div>
                            <span className="text-gray-900 font-semibold text-sm leading-none">
                                {branchName}
                            </span>
                            <ChevronDown className="size-3.5 text-gray-500 group-hover:text-theme-primary transition-colors duration-200 shrink-0" />
                        </button>
                        <span className="text-gray-900 font-medium text-sm whitespace-nowrap leading-none flex items-center">
                            {t('selectOrderType')}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 min-w-0 flex-1 justify-end min-h-10">
                        {activeOrderType === 'delivery' && deliveryAddress ? (
                            <>
                                <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0 max-w-full">
                                    <MapPin className="w-4 h-4 shrink-0 text-theme-primary" />
                                    <span className="truncate block whitespace-nowrap">
                                        {t('deliveryTo')}{' '}
                                        <span className="font-bold">
                                            ({getAddressLabel(deliveryAddress)})
                                        </span>{' '}
                                        <span className="text-gray-600">
                                            {formatAddressForDisplay(
                                                deliveryAddress,
                                            )}
                                        </span>
                                    </span>
                                </div>
                                {orderTime === 'later' && scheduledTime && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Clock className="w-4 h-4 text-theme-primary" />
                                        <span>
                                            {formatScheduledTime(
                                                scheduledTime,
                                                'ar',
                                            )}
                                        </span>
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    variant="secondaryTint"
                                    size="sm"
                                    onClick={() => setIsOrderModalOpen(true)}
                                    className="px-3 py-1.5 text-xs gap-1">
                                    <Edit className="w-3.5 h-3.5" />
                                    {t('edit')}
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center justify-end gap-2 flex-row-reverse">
                                {orderTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() =>
                                            handleOrderTypeClick(type.id)
                                        }
                                        className={`
                                            h-10 px-4 rounded-md text-sm font-medium 
                                            transition-all duration-200 cursor-pointer border
                                            ${
                                                activeOrderType === type.id
                                                    ? activeStyle
                                                    : inactiveStyle
                                            }
                                        `}
                                        aria-pressed={
                                            activeOrderType === type.id
                                        }>
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout - relative z-10 so buttons stay on top and receive touches on small screens */}
                <div className="lg:hidden flex flex-col gap-2 sm:gap-3 md:gap-4 relative z-10">
                    <div className="bg-white rounded-lg sm:rounded-xl h-12 sm:h-14 flex items-center px-3 sm:px-4 shadow-sm border border-gray-200 min-h-[48px]">
                        <button
                            type="button"
                            onClick={handleBranchClick}
                            className="flex items-center gap-2 w-full min-h-[48px] -m-2 p-2 touch-manipulation cursor-pointer rounded-lg active:bg-gray-50/80"
                            aria-label={branchName}>
                            <div className="size-7 sm:size-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 pointer-events-none">
                                <Building2 className="size-4 sm:size-4.5 text-gray-500" />
                            </div>
                            <span className="text-gray-900 font-semibold text-xs sm:text-sm truncate pointer-events-none">
                                {branchName}
                            </span>
                            <ChevronDown className="size-3.5 text-gray-500 ml-auto shrink-0 pointer-events-none" />
                        </button>
                    </div>

                    {activeOrderType === 'delivery' && deliveryAddress && (
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 space-y-2 relative z-10">
                            <div className="flex items-center gap-2 sm:gap-3 text-sm text-gray-700 pointer-events-none min-w-0">
                                <MapPin className="w-4 h-4 text-theme-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-700 text-xs sm:text-sm truncate leading-snug">
                                        <span className="font-medium">
                                            {t('deliveryTo')}{' '}
                                            <span className="text-theme-primary font-bold">
                                                (
                                                {getAddressLabel(
                                                    deliveryAddress,
                                                )}
                                                )
                                            </span>
                                            {' · '}
                                        </span>
                                        <span className="text-gray-600">
                                            {formatAddressForDisplay(
                                                deliveryAddress,
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {orderTime === 'later' && scheduledTime && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 pointer-events-none">
                                    <Clock className="w-4 h-4 text-theme-primary shrink-0" />
                                    <span>
                                        {formatScheduledTime(
                                            scheduledTime,
                                            'ar',
                                        )}
                                    </span>
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="secondaryTint"
                                size="xl"
                                onClick={() => setIsOrderModalOpen(true)}
                                className="w-full mt-2 text-xs sm:text-sm gap-1 active:bg-theme-primary/20">
                                <Edit className="w-3.5 h-3.5 shrink-0" />
                                {t('edit')}
                            </Button>
                        </div>
                    )}

                    {(!deliveryAddress || activeOrderType !== 'delivery') && (
                        <div className="w-full bg-white/10 p-1 rounded-lg sm:rounded-xl border border-white/10 backdrop-blur-sm flex items-center flex-row-reverse relative z-10">
                            {orderTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() =>
                                        handleOrderTypeClick(type.id)
                                    }
                                    className={`
                                        flex-1 min-h-[48px] rounded-lg text-xs font-bold 
                                        transition-all duration-200 cursor-pointer touch-manipulation active:scale-[0.98]
                                        ${
                                            activeOrderType === type.id
                                                ? 'bg-white text-theme-primary shadow-sm'
                                                : 'text-white/80 hover:bg-white/5'
                                        }
                                    `}
                                    aria-pressed={activeOrderType === type.id}>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isOrderModalOpen && (
                <OrderTypeModal
                    isOpen={isOrderModalOpen}
                    onClose={() => setIsOrderModalOpen(false)}
                />
            )}
        </>
    );
}
