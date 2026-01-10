// src/components/modals/OrderTypeModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, MapPin, Clock, Plus, Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
    useOrderStore,
    OrderType,
    OrderTime,
    getScheduledTimeAsDate,
} from '@/store/useOrderStore';
import AddressModal from './AddressModal';
import { cn } from '@/lib/utils';
import { DeliveryAddress } from '@/store/useOrderStore';

interface OrderTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderTypeModal: React.FC<OrderTypeModalProps> = ({ isOpen, onClose }) => {
    const t = useTranslations('Order');
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

    // Convert scheduledTime from string to Date if needed
    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] =
        useState<DeliveryAddress | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus trap and keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSave = () => {
        onClose();
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setShowAddressModal(true);
    };

    const handleEditAddress = () => {
        if (deliveryAddress) {
            setEditingAddress(deliveryAddress);
            setShowAddressModal(true);
        }
    };

    const handleAddressSave = (address: DeliveryAddress) => {
        setDeliveryAddress(address);
        setShowAddressModal(false);
        setEditingAddress(null);
    };

    const handleTimeSelect = (time: OrderTime) => {
        setOrderTime(time);
        if (time === 'now') {
            setScheduledTime(null);
        } else if (!scheduledTime) {
            // Set default to tomorrow at 4:30 PM
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(16, 30, 0, 0);
            setScheduledTime(tomorrow);
        }
    };

    const formatScheduledTime = (date: Date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'م' : 'ص';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${day}/${month}/${year}، ${displayHours}:${minutes
            .toString()
            .padStart(2, '0')} ${period}`;
    };

    if (!isOpen) return null;

    const orderTypes: Array<{ id: OrderType; label: string }> = [
        { id: 'delivery', label: t('delivery') || 'Deliver to my location' },
        { id: 'dineIn', label: t('dineIn') || 'Dine-in at branch' },
        { id: 'pickup', label: t('pickup') || 'Pickup from branch' },
        { id: 'carPickup', label: t('carPickup') || 'Car pickup soon' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-modal-title">
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2
                            id="order-modal-title"
                            className="text-xl font-bold text-gray-900">
                            {t('orderType') || 'Order Type'}
                        </h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={t('close') || 'Close'}>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Order Type Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('selectOrderType') || 'Select order type'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {orderTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setOrderType(type.id)}
                                        className={cn(
                                            'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                            orderType === type.id
                                                ? 'bg-libero-red/5 border-libero-red text-libero-red font-semibold'
                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                        )}
                                        aria-pressed={orderType === type.id}>
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address Section - Only show if delivery is selected */}
                        {orderType === 'delivery' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {t('deliveryAddress') || 'Delivery Address'}
                                </h3>
                                {deliveryAddress ? (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-libero-red shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                                        {deliveryAddress.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {
                                                            deliveryAddress.formatted
                                                        }
                                                    </p>
                                                    {deliveryAddress.notes && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {
                                                                deliveryAddress.notes
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleEditAddress}
                                                    className="px-4 py-2 bg-libero-red text-white text-sm font-medium rounded-lg hover:bg-libero-red/90 transition-colors flex items-center gap-2">
                                                    <Edit className="w-4 h-4" />
                                                    {t('edit') || 'Edit'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddAddress}
                                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-libero-red hover:bg-libero-red/5 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-libero-red">
                                        <Plus className="w-5 h-5" />
                                        <span className="font-medium">
                                            {t('addAddress') || 'Add Address'}
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Order Time Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('selectOrderTime') || 'Select order time'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleTimeSelect('now')}
                                    className={cn(
                                        'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                        orderTime === 'now'
                                            ? 'bg-libero-red/5 border-libero-red text-libero-red font-semibold'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                    )}
                                    aria-pressed={orderTime === 'now'}>
                                    {t('now') || 'Now'}
                                </button>
                                <button
                                    onClick={() => handleTimeSelect('later')}
                                    className={cn(
                                        'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                        orderTime === 'later'
                                            ? 'bg-libero-red/5 border-libero-red text-libero-red font-semibold'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                    )}
                                    aria-pressed={orderTime === 'later'}>
                                    {t('later') || 'Later'}
                                </button>
                            </div>

                            {/* Scheduled Time Display */}
                            {orderTime === 'later' && scheduledTime && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-libero-red shrink-0" />
                                    <p className="text-sm text-gray-700">
                                        {formatScheduledTime(scheduledTime)}
                                    </p>
                                    <button
                                        onClick={() => {
                                            // TODO: Open date/time picker
                                            console.log('Open date picker');
                                        }}
                                        className="ml-auto px-4 py-2 bg-libero-red text-white text-sm font-medium rounded-lg hover:bg-libero-red/90 transition-colors">
                                        {t('change') || 'Change'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 flex items-center justify-end">
                        <button
                            onClick={handleSave}
                            className="w-full bg-libero-red text-white font-semibold py-3 rounded-xl hover:bg-libero-red/90 transition-colors">
                            {t('save') || 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            <AddressModal
                isOpen={showAddressModal}
                onClose={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                }}
                onSave={handleAddressSave}
                initialAddress={editingAddress}
            />
        </>
    );
};

export default OrderTypeModal;
