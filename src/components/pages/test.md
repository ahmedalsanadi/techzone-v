'use client';

import { Building2, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';

const SubHeader = () => {
    const t = useTranslations('SubHeader');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [activeType, setActiveType] = useState('delivery');

    const orderTypes = [
        { id: 'dineIn', label: t('dineIn') },
        { id: 'pickup', label: t('pickup') },
        { id: 'delivery', label: t('delivery') },
    ];

    // Simple cn if lib/utils doesn't exist
    const mergeClasses = (...classes: (string | undefined | boolean)[]) => {
        return classes.filter(Boolean).join(' ');
    };

    return (
        <div
            className={mergeClasses(
                'mt-4 bg-white rounded-[16px] h-[65px] flex items-center justify-between px-4 shadow-md shadow-black/5 border border-[#dae1e9]',
                isRtl ? 'flex-row-reverse' : 'flex-row',
            )}>
            {/* Branch Selector (On the right in RTL, Left in LTR) */}
            <button className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                {isRtl ? (
                    <>
                        <ChevronDown
                            size={14}
                            className="text-[#8795a0] group-hover:text-libero-red transition-colors"
                        />
                        <span className="text-[#121212] font-bold text-[14px]">
                            {t('defaultBranch')}
                        </span>
                        <div className="size-8 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
                            <Building2 size={18} className="text-[#8795a0]" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="size-8 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50">
                            <Building2 size={18} className="text-[#8795a0]" />
                        </div>
                        <span className="text-[#121212] font-bold text-[14px]">
                            {t('defaultBranch')}
                        </span>
                        <ChevronDown
                            size={14}
                            className="text-[#8795a0] group-hover:text-libero-red transition-colors"
                        />
                    </>
                )}
            </button>

            {/* Order Type Selector (On the left in RTL, Right in LTR) */}
            <div
                className={mergeClasses(
                    'flex items-center gap-4',
                    isRtl ? 'flex-row-reverse' : 'flex-row',
                )}>
                <span className="text-[#121212] font-bold text-[14px] whitespace-nowrap">
                    {t('selectOrderType')}
                </span>
                <div className="flex items-center gap-2">
                    {orderTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setActiveType(type.id)}
                            className={mergeClasses(
                                'h-10 px-4 rounded-[12px] text-[13px] font-bold transition-all duration-200',
                                activeType === type.id
                                    ? 'bg-libero-red/5 text-libero-red border border-libero-red/20'
                                    : 'bg-[#F8F9FA] text-[#8795a0] border border-transparent hover:border-gray-200',
                            )}>
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubHeader;
