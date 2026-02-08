import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ChevronRight, Clock, Plus, Edit, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    useOrderStore,
    OrderType,
    OrderTime,
    getScheduledTimeAsDate,
} from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Address } from '@/types/address';
import type { AddressFormSubmitPayload } from '@/types/address';
import AddressModal from './AddressModal';
import { cn } from '@/lib/utils';
import { useAddressFlow } from '@/hooks/address/useAddressFlow';
import {
    getAddressLabel,
    formatAddressForDisplay,
    formatScheduledTime,
    showAddNewAddressButton,
} from '@/lib/address';

interface OrderTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderTypeModal: React.FC<OrderTypeModalProps> = ({ isOpen, onClose }) => {
    const t = useTranslations('Order');
    const locale = useLocale();
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
        setOrderType,
        setDeliveryAddress,
        setScheduledTime,
        setOrderTime,
    } = useOrderStore();
    const { isAuthenticated } = useAuthStore();
    const {
        addresses: displayAddresses,
        isLoading: isLoadingAddresses,
        isError: isErrorAddresses,
        refetch: refetchAddresses,
        saveAddress,
    } = useAddressFlow();

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');

    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);

    // Sync deliveryAddress from available list if not set
    useEffect(() => {
        if (displayAddresses.length > 0 && !deliveryAddress) {
            const prioritized = isAuthenticated
                ? displayAddresses.find((a) => a.is_default) ||
                  displayAddresses[0]
                : displayAddresses[0];
            setDeliveryAddress(prioritized);
        }
    }, [
        displayAddresses,
        deliveryAddress,
        setDeliveryAddress,
        isAuthenticated,
    ]);

    const isSelected = (addrId: number) => {
        if (!deliveryAddress) return false;
        return Number(deliveryAddress.id) === Number(addrId);
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setShowAddressModal(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setShowAddressModal(true);
    };

    const handleAddressSave = async (payload: AddressFormSubmitPayload) => {
        try {
            await saveAddress(
                payload,
                editingAddress ? Number(editingAddress.id) : undefined,
            );
            toast.success(t('addressSaved') || 'Address saved');
            setShowAddressModal(false);
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error('Failed to save address');
        }
    };

    const handleTimeSelect = (time: OrderTime) => {
        setOrderTime(time);
        if (time === 'now') {
            setScheduledTime(null);
            setShowDateTimePicker(false);
        }
    };

    const openDateTimePicker = () => {
        const base = scheduledTime instanceof Date ? scheduledTime : new Date();
        const year = base.getFullYear();
        const month = String(base.getMonth() + 1).padStart(2, '0');
        const day = String(base.getDate()).padStart(2, '0');
        const hours = String(base.getHours()).padStart(2, '0');
        const minutes = String(base.getMinutes()).padStart(2, '0');
        setTempDate(`${year}-${month}-${day}`);
        setTempTime(`${hours}:${minutes}`);
        setShowDateTimePicker(true);
    };

    const handleDateTimeSave = () => {
        if (tempDate && tempTime) {
            const [hours, minutes] = tempTime.split(':').map(Number);
            const selectedDate = new Date(tempDate);
            selectedDate.setHours(hours, minutes, 0, 0);
            if (selectedDate <= new Date())
                selectedDate.setDate(selectedDate.getDate() + 1);
            setScheduledTime(selectedDate);
            setShowDateTimePicker(false);
        }
    };

    const canAddAddress = showAddNewAddressButton(
        isAuthenticated,
        displayAddresses.length,
    );

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-50 focus:outline-none"
                onClose={onClose}>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                    aria-hidden="true"
                />

                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-5">
                        <DialogPanel
                            transition
                            className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative max-h-[92vh] rounded-2xl md:rounded-4xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0">
                            <header className="flex items-center justify-between p-2.5 sm:p-4 md:p-5 lg:p-6 border-b border-gray-100 shrink-0">
                                <DialogTitle
                                    as="h2"
                                    className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                                    {t('orderType')}
                                </DialogTitle>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                                    aria-label={t('close')}>
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto px-2.5 py-4 sm:px-4 sm:py-4 md:p-5 lg:p-6 space-y-5 sm:space-y-4 md:space-y-6 lg:space-y-8">
                                <div>
                                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                                        {t('selectOrderType')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
                                        {(
                                            [
                                                'delivery',
                                                'dineIn',
                                                'pickup',
                                                'carPickup',
                                            ] as OrderType[]
                                        ).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() =>
                                                    setOrderType(type)
                                                }
                                                className={cn(
                                                    'py-2.5 px-3 sm:py-3 sm:px-4 md:p-4 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] rounded-lg sm:rounded-xl md:rounded-2xl border-2 transition-all text-right touch-manipulation text-xs sm:text-sm font-semibold leading-tight',
                                                    orderType === type
                                                        ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-bold shadow-sm'
                                                        : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-700',
                                                )}>
                                                {t(type)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {orderType === 'delivery' && (
                                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 shrink-0">
                                                {t('deliveryAddress')}
                                            </h3>
                                            {canAddAddress &&
                                                displayAddresses.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleAddAddress
                                                        }
                                                        className="text-theme-primary text-xs sm:text-sm font-black flex items-center gap-1 hover:brightness-90 transition-all shrink-0 touch-manipulation py-1">
                                                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{' '}
                                                        {t('addNew')}
                                                    </button>
                                                )}
                                        </div>

                                        {isLoadingAddresses ? (
                                            <div className="space-y-2 sm:space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div
                                                        key={i}
                                                        className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-gray-100 bg-white animate-pulse">
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="h-4 sm:h-5 w-28 bg-gray-200 rounded" />
                                                                <div className="h-3 sm:h-4 w-48 bg-gray-100 rounded mt-2" />
                                                            </div>
                                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : isErrorAddresses ? (
                                            <div className="p-6 sm:p-8 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 text-center space-y-3">
                                                <p className="text-sm sm:text-base font-semibold text-gray-700">
                                                    {t('addressLoadFailed') ||
                                                        'Failed to load addresses'}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        refetchAddresses()
                                                    }
                                                    className="min-h-[44px] px-5 py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                                                    {t('retry') || 'Retry'}
                                                </button>
                                            </div>
                                        ) : displayAddresses.length > 0 ? (
                                            <div className="space-y-2 sm:space-y-3">
                                                {displayAddresses.map(
                                                    (addr) => (
                                                        <div
                                                            key={addr.id}
                                                            onClick={() =>
                                                                setDeliveryAddress(
                                                                    addr,
                                                                )
                                                            }
                                                            className={cn(
                                                                'p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer group relative',
                                                                isSelected(
                                                                    addr.id,
                                                                )
                                                                    ? 'bg-theme-primary/5 border-theme-primary shadow-lg shadow-theme-primary/5'
                                                                    : 'bg-white border-gray-100 hover:border-gray-200',
                                                            )}>
                                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                                <div
                                                                    className={cn(
                                                                        'w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all flex items-center justify-center shrink-0',
                                                                        isSelected(
                                                                            addr.id,
                                                                        )
                                                                            ? 'border-theme-primary bg-theme-primary'
                                                                            : 'border-gray-300',
                                                                    )}>
                                                                    {isSelected(
                                                                        addr.id,
                                                                    ) && (
                                                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-bold text-gray-900 text-sm sm:text-base">
                                                                        {getAddressLabel(
                                                                            addr,
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-0.5 wrap-break-word">
                                                                        {formatAddressForDisplay(
                                                                            addr,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleEditAddress(
                                                                            addr,
                                                                        );
                                                                    }}
                                                                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all shrink-0 touch-manipulation">
                                                                    <Edit className="w-4 h-4 text-gray-400" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleAddAddress}
                                                className="w-full p-8 sm:p-10 border-2 border-dashed border-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl hover:border-theme-primary hover:bg-theme-primary/5 group transition-all touch-manipulation">
                                                <Plus className="w-8 h-8 mx-auto text-gray-300 group-hover:text-theme-primary mb-2 sm:mb-3" />
                                                <span className="font-black text-gray-400 group-hover:text-theme-primary text-sm sm:text-base">
                                                    {t('addAddress')}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                                        {t('selectOrderTime')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
                                        {(['now', 'later'] as OrderTime[]).map(
                                            (time) => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() =>
                                                        handleTimeSelect(time)
                                                    }
                                                    className={cn(
                                                        'py-2.5 px-3 sm:py-3 sm:px-4 md:p-4 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] rounded-lg sm:rounded-xl md:rounded-2xl border-2 transition-all text-right touch-manipulation text-xs sm:text-sm font-semibold',
                                                        orderTime === time
                                                            ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-bold shadow-sm'
                                                            : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-700',
                                                    )}>
                                                    {t(time)}
                                                </button>
                                            ),
                                        )}
                                    </div>

                                    {orderTime === 'later' && (
                                        <div className="p-3 sm:p-4 md:p-5 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <div className="p-2 sm:p-2.5 bg-theme-primary/10 rounded-lg sm:rounded-xl shrink-0">
                                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary" />
                                                </div>
                                                <span className="text-xs sm:text-sm font-bold text-gray-700 truncate">
                                                    {scheduledTime
                                                        ? formatScheduledTime(
                                                              scheduledTime,
                                                              locale,
                                                          )
                                                        : t('selectDateTime')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={openDateTimePicker}
                                                className="text-theme-primary font-black text-sm hover:underline">
                                                {t('change')}
                                            </button>
                                        </div>
                                    )}

                                    {showDateTimePicker && (
                                        <div className="p-4 sm:p-5 md:p-6 bg-white border border-gray-100 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl space-y-3 sm:space-y-4 animate-in slide-in-from-top-4 duration-300">
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                <input
                                                    type="date"
                                                    value={tempDate}
                                                    onChange={(e) =>
                                                        setTempDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full p-2.5 sm:p-3 bg-gray-50 border-0 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base"
                                                />
                                                <input
                                                    type="time"
                                                    value={tempTime}
                                                    onChange={(e) =>
                                                        setTempTime(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full p-2.5 sm:p-3 bg-gray-50 border-0 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowDateTimePicker(
                                                            false,
                                                        )
                                                    }
                                                    className="min-h-[44px] px-4 sm:px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-lg sm:rounded-xl transition-all touch-manipulation">
                                                    {t('cancel')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDateTimeSave}
                                                    className="min-h-[44px] px-6 sm:px-8 py-2.5 bg-theme-primary text-white font-black rounded-lg sm:rounded-xl shadow-lg shadow-theme-primary/20 hover:brightness-95 active:scale-[0.98] transition-all touch-manipulation">
                                                    {t('save')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <footer className="p-2.5 sm:p-4 md:p-5 lg:p-6 border-t border-gray-100 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full min-h-[48px] bg-theme-primary text-white font-black py-3 text-sm sm:text-base rounded-lg sm:rounded-xl shadow-xl shadow-theme-primary/20 hover:brightness-95 active:scale-[0.98] transition-all touch-manipulation">
                                    {t('save')}
                                </button>
                            </footer>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {showAddressModal && (
                <AddressModal
                    isOpen={showAddressModal}
                    onClose={() => {
                        setShowAddressModal(false);
                        setEditingAddress(null);
                    }}
                    onSave={handleAddressSave}
                    initialAddress={editingAddress}
                />
            )}
        </>
    );
};

export default OrderTypeModal;
