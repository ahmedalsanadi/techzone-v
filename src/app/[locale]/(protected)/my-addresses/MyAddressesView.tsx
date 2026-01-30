// src/app/[locale]/(protected)/my-addresses/MyAddressesView.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, MapPin, Loader2, Home as HomeIcon } from 'lucide-react';
import { Address, AddressFormSubmitPayload } from '@/types/address';
import AddressCard from './AddressCard';
import AddressModal from '@/components/modals/AddressModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { Button } from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { toast } from 'sonner';
import { useAddressFlow } from '@/hooks/address/useAddressFlow';
import { usePrefetchAddress } from '@/hooks/useAddresses';

export default function MyAddressesView() {
    const t = useTranslations('MyAddresses');
    const { addresses, isLoading, saveAddress, deleteAddress, setDefault } =
        useAddressFlow();
    const prefetchAddress = usePrefetchAddress();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdd = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteTargetId(id);
    };

    const handleDeleteConfirm = async () => {
        if (deleteTargetId == null) return;
        setIsDeleting(true);
        try {
            await deleteAddress(deleteTargetId);
            toast.success(t('deleteSuccess'));
            setDeleteTargetId(null);
        } catch {
            toast.error(t('deleteError'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefault(id);
            toast.success(t('defaultUpdated'));
        } catch {
            toast.error(t('defaultError'));
        }
    };

    const handleSave = async (payload: AddressFormSubmitPayload) => {
        // Type safe via buildPayload in modal
        try {
            await saveAddress(
                payload,
                editingAddress ? Number(editingAddress.id) : undefined,
            );
            toast.success(
                editingAddress ? t('updateSuccess') : t('addSuccess'),
            );
            setIsModalOpen(false);
            setEditingAddress(null);
        } catch {
            toast.error('Failed to save address');
        }
    };

    const breadcrumbs = [
        { label: t('home'), href: '/' },
        { label: t('title') },
    ];

    return (
        <div className="mt-4 space-y-4 sm:space-y-6 md:space-y-8">
            <div className="px-0 sm:px-1">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            <div className="bg-white shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-end justify-between gap-3 sm:gap-4 md:gap-6 overflow-hidden relative rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
                <div className="absolute top-0 start-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-theme-primary/5 rounded-full -ms-10 -mt-10 sm:-ms-12 sm:-mt-12 md:-ms-16 md:-mt-16" />

                <div className="flex flex-col items-center md:items-start text-center md:text-start relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl bg-theme-primary/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 ring-2 sm:ring-4 md:ring-8 ring-theme-primary/5">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-theme-primary" />
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold md:font-black text-gray-900">
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium mt-0.5 sm:mt-1 max-w-sm px-1 sm:px-0">
                        {t('subtitle')}
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={handleAdd}
                    className="w-full md:w-auto min-h-[48px] sm:min-h-[52px] md:h-14 px-5 sm:px-6 md:px-8 lg:px-10 rounded-lg sm:rounded-xl md:rounded-2xl bg-theme-primary hover:brightness-95 text-white font-bold text-sm sm:text-base md:text-lg shadow-lg shadow-theme-primary/10 transition-all active:scale-[0.98] touch-manipulation relative z-10 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5 shrink-0" />
                    {t('addNew')}
                </Button>
            </div>

            <div className="bg-gray-50/50 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 border border-gray-100/80 min-h-[260px] sm:min-h-[320px] md:min-h-[400px] flex flex-col items-center justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-8 sm:py-12">
                        <Loader2 className="w-10 h-10 text-theme-primary animate-spin" />
                        <span className="text-gray-500 font-bold tracking-widest uppercase text-xs">
                            {t('syncingWithCloud')}
                        </span>
                    </div>
                ) : addresses.length > 0 ? (
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onSetDefault={handleSetDefault}
                                onMouseEnter={() =>
                                    prefetchAddress(Number(address.id))
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mb-4 sm:mb-6">
                            <HomeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            {t('noAddresses')}
                        </h3>
                        <p className="text-gray-500 text-sm sm:text-base max-w-xs mb-6 sm:mb-8">
                            Add your first address to enjoy faster checkout and
                            delivery.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAdd}
                            className="min-h-[48px] rounded-lg sm:rounded-xl px-6 sm:px-8 touch-manipulation">
                            {t('addNew')}
                        </Button>
                    </div>
                )}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAddress(null);
                }}
                onSave={handleSave}
                initialAddress={editingAddress}
            />

            <ConfirmModal
                isOpen={deleteTargetId != null}
                onClose={() => setDeleteTargetId(null)}
                title={t('deleteTitle')}
                message={t('deleteConfirm')}
                confirmLabel={t('confirmDelete')}
                cancelLabel={t('cancel')}
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
