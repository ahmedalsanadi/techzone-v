// src/app/[locale]/(protected)/my-addresses/AddressCard.tsx
'use client';

import { MapPin, Trash2, Edit, Check } from 'lucide-react';
import { DeliveryAddress } from '@/store/useOrderStore';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface AddressCardProps {
    address: DeliveryAddress;
    onEdit: (address: DeliveryAddress) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
}

export default function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
}: AddressCardProps) {
    const t = useTranslations('MyAddresses');

    return (
        <div
            onClick={() => !address.isDefault && onSetDefault(address.id)}
            className={cn(
                'group relative bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 transition-all cursor-pointer',
                address.isDefault
                    ? 'border-theme-primary shadow-lg shadow-theme-primary/10'
                    : 'border-gray-100 hover:border-theme-primary/30 shadow-sm',
            )}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4">
                    <div
                        className={cn(
                            'mt-1 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                            address.isDefault
                                ? 'bg-theme-primary/10'
                                : 'bg-gray-50 group-hover:bg-theme-primary/5',
                        )}>
                        <MapPin
                            className={cn(
                                'w-5 h-5 md:w-6 md:h-6',
                                address.isDefault
                                    ? 'text-theme-primary'
                                    : 'text-gray-400 group-hover:text-theme-primary/70',
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg">
                                {address.name}
                            </h3>
                            {address.isDefault && (
                                <span className="bg-theme-primary text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {t('default')}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm md:text-md leading-relaxed line-clamp-2">
                            {address.formatted}
                        </p>
                        {address.notes && (
                            <p className="text-gray-400 text-xs mt-1 italic">
                                "{address.notes}"
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className="flex flex-col gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onEdit(address)}
                        className="p-2 md:p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-theme-primary/10 hover:text-theme-primary transition-all active:scale-90"
                        title={t('edit' as any) || 'Edit'}>
                        <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(address.id)}
                        className="p-2 md:p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                        title={t('delete' as any) || 'Delete'}>
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* Default Indicator (Overlay or subtle check) */}
            {address.isDefault && (
                <div className="absolute top-3 end-3 md:top-4 md:end-4">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-theme-primary rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white">
                        <Check className="w-3 h-3 md:w-4 md:h-4 stroke-2" />
                    </div>
                </div>
            )}
        </div>
    );
}
