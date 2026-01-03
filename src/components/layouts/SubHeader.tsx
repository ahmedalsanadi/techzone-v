//src/components/layouts/SubHeader.tsx
'use client';

import { Building2, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function SubHeader() {
    const t = useTranslations('SubHeader');
    const [activeType, setActiveType] = useState('delivery');

    const orderTypes = [
        { id: 'dineIn', label: t('dineIn') },
        { id: 'pickup', label: t('pickup') },
        { id: 'delivery', label: t('delivery') },
    ];

    const activeStyle = 'bg-libero-red/5 text-libero-red border-libero-red/20';
    const inactiveStyle = 'bg-gray-50 text-gray-500 hover:border-gray-200';

    return (
        <div className="mt-4 bg-white rounded-t-xl h-16 flex items-center justify-between px-4 shadow-t-sm border-t border-gray-200">
            <button
                className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 group"
                aria-label={t('defaultBranch')}>
                <div className="size-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
                    <Building2 className="size-4.5 text-gray-500" />
                </div>
                <span className="text-gray-900 font-semibold text-sm">
                    {t('defaultBranch')}
                </span>
                <ChevronDown className="size-3.5 text-gray-500 group-hover:text-libero-red transition-colors duration-200" />
            </button>

            <div className="flex items-center gap-4">
                <span className="text-gray-900 font-medium text-sm whitespace-nowrap">
                    {t('selectOrderType')}
                </span>
                <div className="flex items-center gap-2">
                    {orderTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setActiveType(type.id)}
                            className={`
                                h-10 px-4 rounded-md text-sm font-medium 
                                transition-all duration-200 cursor-pointer border
                                ${
                                    activeType === type.id
                                        ? activeStyle
                                        : inactiveStyle
                                }
                            `}
                            aria-pressed={activeType === type.id}>
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
